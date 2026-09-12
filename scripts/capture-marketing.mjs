#!/usr/bin/env node
/**
 * Captures the marketing screenshots and GIFs used on the landing page.
 *
 * It drives a headless Chrome over CDP against a running dev server, lets the
 * app build the starter model through its own onboarding, then shoots every
 * view in both themes so the landing can swap images with the theme.
 *
 *   npm run dev -- --port 5199        # in another shell
 *   node scripts/capture-marketing.mjs [--url http://localhost:5199]
 *
 * GIF encoding needs ffmpeg on PATH.
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT_DIR = path.join(ROOT, 'src/assets/marketing');
const FRAME_DIR = path.join(tmpdir(), 'viaduct-marketing-frames');

const argUrl = process.argv.indexOf('--url');
const BASE_URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5199';
const CHROME =
  process.env.CHROME_BIN ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const VIEWPORT = { width: 1440, height: 900 };
const DPR = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── CDP plumbing ─────────────────────────────────────────────────────────────

async function launchChrome(port, profileDir) {
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      `--force-device-scale-factor=${DPR}`,
      '--hide-scrollbars',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
    ],
    { stdio: 'ignore' }
  );
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const info = await res.json();
      return { child, wsUrl: info.webSocketDebuggerUrl };
    } catch {
      await sleep(250);
    }
  }
  child.kill();
  throw new Error('Chrome did not expose a debugging port');
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl, { maxPayload: 256 * 1024 * 1024 });
  const pending = new Map();
  let nextId = 1;
  let sessionId = null;

  const ready = new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });

  const send = (method, params = {}, useSession = true) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(
        JSON.stringify({
          id,
          method,
          params,
          ...(useSession && sessionId ? { sessionId } : {}),
        })
      );
    });

  return {
    ready,
    send,
    attach(id) {
      sessionId = id;
    },
    close: () => ws.close(),
  };
}

// ── page helpers ─────────────────────────────────────────────────────────────

async function makePage() {
  const port = 9222 + Math.floor(Math.random() * 500);
  const profileDir = path.join(tmpdir(), `viaduct-capture-${port}`);
  rmSync(profileDir, { recursive: true, force: true });
  const { child, wsUrl } = await launchChrome(port, profileDir);
  const cdp = connect(wsUrl);
  await cdp.ready;

  const { targetId } = await cdp.send(
    'Target.createTarget',
    { url: 'about:blank' },
    false
  );
  const { sessionId } = await cdp.send(
    'Target.attachToTarget',
    { targetId, flatten: true },
    false
  );
  cdp.attach(sessionId);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    deviceScaleFactor: DPR,
    mobile: false,
  });

  const evaluate = async (expression) => {
    const res = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'eval failed');
    }
    return res.result.value;
  };

  const goto = async (url) => {
    await cdp.send('Page.navigate', { url });
    await sleep(1200);
  };

  const shot = async (file) => {
    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    writeFileSync(file, Buffer.from(data, 'base64'));
  };

  /** Retina PNG in, page-weight-friendly WebP out. */
  const shotWebp = async (file) => {
    const tmp = path.join(tmpdir(), `viaduct-shot-${Date.now()}.png`);
    await shot(tmp);
    execFileSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-i', tmp, '-vf', 'scale=1800:-1:flags=lanczos',
       '-c:v', 'libwebp', '-quality', '82', file],
      { stdio: 'ignore' }
    );
    rmSync(tmp, { force: true });
  };

  return {
    evaluate,
    goto,
    shot,
    shotWebp,
    close: async () => {
      cdp.close();
      child.kill();
      // Chrome writes to the profile as it exits; give it a beat before removing.
      await sleep(500);
      try {
        rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch {
        /* a leftover temp profile is harmless */
      }
    },
  };
}

/** Click the first element whose text matches, in page context. */
const clickByText = (text) => `(() => {
  const el = [...document.querySelectorAll('button, [role="button"], a')]
    .find((n) => n.textContent.trim().startsWith(${JSON.stringify(text)}));
  if (!el) return false;
  el.click();
  return true;
})()`;

const CLEAN_UP = `(() => {
  /* Marketing shots show the product, not its transient chrome. */
  document.querySelectorAll('[data-testid="tips-tour"], [role="tooltip"]').forEach((n) => n.remove());
  return true;
})()`;

const FIT_VIEW = `(() => {
  const btn = document.querySelector('[aria-label="Fit view"], [title="Fit view"]');
  if (btn) { btn.click(); return true; }
  return false;
})()`;

// ── capture plan ─────────────────────────────────────────────────────────────

async function seedModel(page) {
  await page.goto(`${BASE_URL}/editor`);
  await sleep(2500);
  // Onboarding builds the demo model for us — no fixture to keep in sync.
  await page.evaluate(clickByText('Start from a template'));
  await sleep(2500);
  await page.evaluate(clickByText('Skip tour'));
  await sleep(600);
  await page.evaluate(`localStorage.setItem('c4-tips-tour-v1', '1')`);
}

/** Rewind the persisted view to the system level (Home in the editor exits to
 *  the landing page, which is not what a capture wants). */
const RESET_VIEW = `(() => {
  const raw = localStorage.getItem('c4modelizer_flat_store');
  if (!raw) return false;
  const data = JSON.parse(raw);
  const model = data?.state?.model;
  if (!model) return false;
  model.viewLevel = 'system';
  delete model.activeSystemId;
  delete model.activeContainerId;
  delete model.activeComponentId;
  localStorage.setItem('c4modelizer_flat_store', JSON.stringify(data));
  return true;
})()`;

/**
 * The editor remembers the level you left it on, so every capture starts by
 * walking back up to the system context — otherwise a run picks up wherever the
 * previous one stopped.
 */
async function setTheme(page, theme) {
  await page.evaluate(`localStorage.setItem('c4-color-mode', ${JSON.stringify(theme)})`);
  await page.evaluate(RESET_VIEW);
  await page.goto(`${BASE_URL}/editor`);
  await sleep(2400);
  await page.evaluate(CLEAN_UP);
}

async function captureStills(page, theme) {
  const suffix = theme === 'light' ? 'light' : 'dark';

  await setTheme(page, theme);
  await page.evaluate(FIT_VIEW);
  await sleep(900);
  await page.shotWebp(path.join(OUT_DIR, `system-context-${suffix}.webp`));

  // Drill into the first system → container level.
  await page.evaluate(`(() => {
    const btn = document.querySelector('[data-testid="block-drilldown-button"]');
    if (btn) btn.click();
    return Boolean(btn);
  })()`);
  await sleep(1400);
  await page.evaluate(FIT_VIEW);
  await sleep(900);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `containers-${suffix}.webp`));

  // Database schema (ER) view of the datastore container.
  await page.evaluate(`(() => {
    const cards = [...document.querySelectorAll('.tech-card')];
    const store = cards.find((c) => /postgre|sql|database/i.test(c.textContent || ''));
    if (!store) return false;
    const rect = store.getBoundingClientRect();
    const opts = { bubbles: true, clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 };
    store.dispatchEvent(new MouseEvent('dblclick', opts));
    return true;
  })()`);
  await sleep(1600);
  await page.evaluate(FIT_VIEW);
  await sleep(900);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `schema-${suffix}.webp`));
}


/**
 * Frames → GIF and MP4. The GIF is the artefact people paste into a README or
 * a chat; the MP4 is an order of magnitude smaller, so it is what the landing
 * page loads.
 */
function encodeMotion(name, { width = 1000, fps = 8, colors = 144 } = {}) {
  execFileSync(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-framerate', String(fps),
      '-i', path.join(FRAME_DIR, 'f%03d.png'),
      '-vf',
      `scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4`,
      '-loop', '0',
      path.join(OUT_DIR, `${name}.gif`),
    ],
    { stdio: 'ignore' }
  );
  execFileSync(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-framerate', String(fps),
      '-i', path.join(FRAME_DIR, 'f%03d.png'),
      '-vf', `scale=${Math.round(width * 1.4)}:-2:flags=lanczos`,
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '26',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      path.join(OUT_DIR, `${name}.mp4`),
    ],
    { stdio: 'ignore' }
  );
  // Still poster — shown when the visitor asked for reduced motion.
  execFileSync(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-i', path.join(FRAME_DIR, 'f000.png'),
      '-vf', `scale=${Math.round(width * 1.4)}:-1:flags=lanczos`,
      '-c:v', 'libwebp', '-quality', '82',
      path.join(OUT_DIR, `${name}-poster.webp`),
    ],
    { stdio: 'ignore' }
  );
}

/** Click the first list row inside a side panel, by its visible title. */
const clickPanelRow = (panel, title) => `(() => {
  const root = document.querySelector('[data-panel="${panel}"]');
  if (!root) return false;
  const hit = [...root.querySelectorAll('*')].filter(
    (n) => n.children.length === 0 && n.textContent.trim() === ${JSON.stringify(title)}
  ).pop();
  if (!hit) return false;
  hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return true;
})()`;

const clickSelector = (selector) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return false;
  el.click();
  return true;
})()`;

const pressKey = (key) => `(() => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(key)}, bubbles: true }));
  return true;
})()`;

/**
 * Documentation editor: Markdown on the left, live preview on the right. The
 * seeded "How to write docs here" page is the one that shows tables and an
 * embedded sequence, so it doubles as the feature's own explanation.
 */
async function captureDocs(page, suffix) {
  await page.evaluate(`(() => {
    const btn = document.querySelector('[data-testid="block-drilldown-button"]');
    if (btn) btn.click();
    return Boolean(btn);
  })()`);
  await sleep(1600);
  await page.evaluate(`(() => {
    const card = [...document.querySelectorAll('.tech-card')].find((c) =>
      /Single-Page Application/.test(c.textContent || '')
    );
    const badge = card?.querySelector('[data-docs-sidebar-trigger] button');
    if (badge) badge.click();
    return Boolean(badge);
  })()`);
  await sleep(1200);
  await page.evaluate(clickPanelRow('documentation', 'How to write docs here'));
  await sleep(2200);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `docs-${suffix}.webp`));
}

/** Sequence editor: PlantUML source next to the rendered diagram. */
async function captureSequence(page, suffix) {
  await page.evaluate(`(() => {
    const card = [...document.querySelectorAll('.tech-card')].find((c) =>
      /API Application/.test(c.textContent || '')
    );
    const badge = card?.querySelector('[data-sequence-sidebar-trigger] button');
    if (badge) badge.click();
    return Boolean(badge);
  })()`);
  await sleep(1200);
  await page.evaluate(clickPanelRow('sequence-diagrams', 'Transfer between accounts'));
  await sleep(2600);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `sequence-${suffix}.webp`));
}

/** Share dialog and the service catalog — used by the documentation page. */
async function captureCollab(page, suffix) {
  await page.evaluate(clickSelector('[data-testid="toolbar-share"]'));
  await sleep(1600);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `share-${suffix}.webp`));

  await page.goto(`${BASE_URL}/catalog`);
  await sleep(2600);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `catalog-${suffix}.webp`));
}

/** Magic flows editor, then the player walking the flow across the diagram. */
async function captureFlows(page, suffix) {
  await page.goto(`${BASE_URL}/flows`);
  await sleep(2600);
  await page.evaluate(CLEAN_UP);
  await page.shotWebp(path.join(OUT_DIR, `flows-${suffix}.webp`));
}

/**
 * The player runs on the diagram, so it is started from the flow badge on a
 * card — the playback overlay hides itself on the /flows route.
 */
async function captureFlowPlayer(page, suffix) {
  await page.evaluate(`(() => {
    const btn = document.querySelector('[data-testid="block-drilldown-button"]');
    if (btn) btn.click();
    return Boolean(btn);
  })()`);
  await sleep(1600);
  await page.evaluate(FIT_VIEW);
  await sleep(800);
  await page.evaluate(`(() => {
    const card = [...document.querySelectorAll('.tech-card')].find((c) =>
      /Single-Page Application/.test(c.textContent || '')
    );
    const badge = card?.querySelector('[data-flow-sidebar-trigger] button');
    if (badge) badge.click();
    return Boolean(badge);
  })()`);
  await sleep(1200);
  await page.evaluate(clickPanelRow('data-flows', 'Payment leaves the bank'));
  await sleep(1800);

  rmSync(FRAME_DIR, { recursive: true, force: true });
  mkdirSync(FRAME_DIR, { recursive: true });
  let frame = 0;
  const grab = async () => {
    await page.shot(path.join(FRAME_DIR, `f${String(frame++).padStart(3, '0')}.png`));
  };

  for (let i = 0; i < 3; i += 1) {
    await sleep(200);
    await grab();
  }
  for (let step = 0; step < 5; step += 1) {
    await page.evaluate(pressKey('ArrowRight'));
    for (let i = 0; i < 3; i += 1) {
      await sleep(220);
      await grab();
    }
  }
  for (let i = 0; i < 3; i += 1) {
    await sleep(200);
    await grab();
  }

  encodeMotion(`flow-player-${suffix}`, { width: 880, fps: 5, colors: 112 });

  rmSync(FRAME_DIR, { recursive: true, force: true });
}

async function captureDrillGif(page, theme) {
  const suffix = theme === 'light' ? 'light' : 'dark';
  rmSync(FRAME_DIR, { recursive: true, force: true });
  mkdirSync(FRAME_DIR, { recursive: true });

  await setTheme(page, theme);
  await page.evaluate(FIT_VIEW);
  await sleep(1000);

  let frame = 0;
  const grab = async () => {
    await page.shot(path.join(FRAME_DIR, `f${String(frame++).padStart(3, '0')}.png`));
  };

  for (let i = 0; i < 6; i += 1) await grab();

  await page.evaluate(`(() => {
    const btn = document.querySelector('[data-testid="block-drilldown-button"]');
    if (btn) btn.click();
    return Boolean(btn);
  })()`);
  for (let i = 0; i < 10; i += 1) {
    await sleep(120);
    await grab();
  }
  await page.evaluate(FIT_VIEW);
  for (let i = 0; i < 12; i += 1) {
    await sleep(120);
    await grab();
  }
  await page.evaluate(`(() => {
    const crumb = [...document.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Systems'
    );
    if (crumb) crumb.click();
    return Boolean(crumb);
  })()`);
  for (let i = 0; i < 10; i += 1) {
    await sleep(120);
    await grab();
  }

  encodeMotion(`drill-down-${suffix}`, { width: 1000, fps: 10, colors: 144 });

  rmSync(FRAME_DIR, { recursive: true, force: true });
}

/**
 * Change sets — from a fixture, not from the app.
 *
 * They stand on a pinned version of a cloud project, so the local editor this
 * script drives has nothing to show. `scripts/marketing/change-sets.html`
 * renders the real page against demo data and marks itself ready; here we only
 * wait and shoot.
 */
async function captureChangeSets(page, suffix) {
  for (const scene of ['catalog', 'new']) {
    await page.goto(
      `${BASE_URL}/scripts/marketing/change-sets.html?scene=${scene}&mode=${suffix}`
    );
    for (let i = 0; i < 40; i += 1) {
      await sleep(250);
      const ready = await page.evaluate(
        `document.documentElement.getAttribute('data-scene') === 'ready'`
      );
      if (ready) break;
    }
    await sleep(400);
    const name = scene === 'catalog' ? 'change-sets' : 'change-set-new';
    await page.shotWebp(path.join(OUT_DIR, `${name}-${suffix}.webp`));
  }
}

async function main() {
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome not found at ${CHROME} — set CHROME_BIN`);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const page = await makePage();
  try {
    await seedModel(page);
    for (const theme of ['dark', 'light']) {
      const suffix = theme === 'light' ? 'light' : 'dark';
      await captureStills(page, theme);
      await captureDrillGif(page, theme);
      await setTheme(page, theme);
      await captureDocs(page, suffix);
      await setTheme(page, theme);
      await page.evaluate(`(() => {
        const btn = document.querySelector('[data-testid="block-drilldown-button"]');
        if (btn) btn.click();
        return Boolean(btn);
      })()`);
      await sleep(1600);
      await captureSequence(page, suffix);
      await setTheme(page, theme);
      await captureCollab(page, suffix);
      await setTheme(page, theme);
      await captureFlows(page, suffix);
      await setTheme(page, theme);
      await captureFlowPlayer(page, suffix);
      await captureChangeSets(page, suffix);
      console.log(`captured ${theme}`);
    }
  } finally {
    await page.close();
  }
  console.log(`written to ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
