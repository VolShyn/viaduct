/**
 * Capture scene for the change-set screenshots.
 *
 * The rest of the marketing shots are taken from the real app in the local
 * editor, which needs no account. Change sets cannot be: they stand on a pinned
 * version of a cloud project, so the app has nothing to show without a signed-in
 * session and a server. This renders the real `ChangeSetsPage` against demo data
 * instead — same component, same styling, fixed content — so the shots can be
 * regenerated without handing a capture script somebody's credentials.
 *
 * Served by the dev server at /scripts/marketing/change-sets.html and driven by
 * `scripts/capture-marketing.mjs`. Not part of the app bundle.
 */
import { ColorModeProvider, useColorMode } from '@contexts/ColorModeContext';
import ChangeSetsPage from '@/pages/ChangeSetsPage';
import { useFlatC4Store } from '@archivisio/c4-modelizer-sdk';
import { CANVAS_DOT_GAP, CANVAS_DOT_SIZE } from '@theme/canvasSurfaces';
import { Box } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import '../../src/i18n';
import '../../src/index.css';

const params = new URLSearchParams(location.search);
/** `catalog` — a change set in flight; `new` — the create form, filled in. */
const scene = params.get('scene') || 'catalog';
/* The theme comes in the URL: a headless capture has no prior localStorage. */
const mode = params.get('mode');
if (mode === 'dark' || mode === 'light') {
  try {
    localStorage.setItem('c4-color-mode', mode);
  } catch {
    /* ignore */
  }
}

/** Fixed timestamps — a screenshot that says "2 minutes ago" ages badly. */
const iso = (minutesAgo: number) =>
  new Date(Date.UTC(2026, 7, 21, 9, 40) - minutesAgo * 60_000).toISOString();

const snapshots = [
  { id: 'snap_3', name: 'v4 — subscriptions', pinned: 1, created_at: iso(180), created_by_name: 'Ada Bell', created_by_username: 'ada' },
  { id: 'snap_2', name: 'v3 — billing split', pinned: 1, created_at: iso(2600), created_by_name: 'Ada Bell', created_by_username: 'ada' },
  { id: 'snap_1', name: 'v2 — first cut', pinned: 1, created_at: iso(9000), created_by_name: 'Ada Bell', created_by_username: 'ada' },
];

const changeSets = [
  {
    id: 'cs_7f31ab90c2',
    project_id: 'p1',
    revision_id: 'snap_3',
    revision_name: 'v4 — subscriptions',
    intent: 'Introduce subscription creation',
    status: 'implementing',
    scope: ['ctr_api', 'cmp_post_subscriptions', 'ctr_db'],
    constraints: {
      framework: 'NestJS',
      persistence: 'PostgreSQL',
      reliability: ['outbox', 'idempotency'],
      forbidden: ['direct database access across service boundaries'],
    },
    base_code_ref: 'main@8af31cd',
    created_by: 'u1',
    created_at: iso(170),
    updated_at: iso(12),
    criteria: [
      { id: 'ac_4c19d7ab', text: 'POST /subscriptions returns 201 with the created subscription', position: 0, status: 'done' },
      { id: 'ac_91b0e4f2', text: 'A repeated Idempotency-Key returns the first result, not a duplicate', position: 1, status: 'done' },
      { id: 'ac_2ad55c17', text: 'subscription.created is published through the outbox after commit', position: 2, status: 'pending' },
      { id: 'ac_d0f7be34', text: 'An unknown plan is rejected with 422 and a field-level error', position: 3, status: 'pending' },
    ],
    progress: [
      { id: 'pr_1', criterion_id: 'ac_4c19d7ab', summary: 'Endpoint, DTO validation and the subscriptions table', ref: 'e41c7d2', actor: 'claude-code', created_at: iso(96) },
      { id: 'pr_2', criterion_id: 'ac_91b0e4f2', summary: 'Idempotency-Key stored with the request hash; replay returns the first response', ref: '9b02fa5', actor: 'claude-code', created_at: iso(41) },
      { id: 'pr_3', criterion_id: null, summary: 'Outbox table and dispatcher wired, publisher still to come', ref: '3d77c10', actor: 'claude-code', created_at: iso(12) },
    ],
  },
  {
    id: 'cs_b28c40de91',
    project_id: 'p1',
    revision_id: 'snap_3',
    revision_name: 'v4 — subscriptions',
    intent: 'Stream billing events to the client over a socket',
    status: 'ready',
    scope: ['ctr_api'],
    constraints: { framework: 'NestJS' },
    base_code_ref: null,
    created_by: 'u1',
    created_at: iso(150),
    updated_at: iso(150),
    criteria: [
      { id: 'ac_66aa1c08', text: 'WS /ws/billing pushes one message per accepted payment', position: 0, status: 'pending' },
      { id: 'ac_7c3e90b1', text: 'A dropped connection resumes from the last delivered event id', position: 1, status: 'pending' },
    ],
    progress: [],
  },
  {
    id: 'cs_10ce55a4f7',
    project_id: 'p1',
    revision_id: 'snap_2',
    revision_name: 'v3 — billing split',
    intent: 'Split the billing container out of the monolith',
    status: 'done',
    scope: ['sys_payments', 'ctr_api'],
    constraints: { persistence: 'PostgreSQL' },
    base_code_ref: 'main@1c09be4',
    created_by: 'u1',
    created_at: iso(2500),
    updated_at: iso(900),
    criteria: [
      { id: 'ac_5b1c77de', text: 'Billing runs as its own deployable with its own schema', position: 0, status: 'done' },
      { id: 'ac_ee20a913', text: 'The monolith reaches billing only over HTTP', position: 1, status: 'done' },
    ],
    progress: [
      { id: 'pr_4', criterion_id: 'ac_5b1c77de', summary: 'Billing service extracted, schema migrated', ref: '77c1e08', actor: 'claude-code', created_at: iso(1400) },
      { id: 'pr_5', criterion_id: 'ac_ee20a913', summary: 'Direct table reads replaced with the billing client', ref: 'a90d4b6', actor: 'claude-code', created_at: iso(900) },
    ],
  },
  {
    id: 'cs_3ab7c1f0d5',
    project_id: 'p1',
    revision_id: 'snap_3',
    revision_name: 'v4 — subscriptions',
    intent: 'Retry failed webhooks from the outbox',
    status: 'draft',
    scope: [],
    constraints: {},
    base_code_ref: null,
    created_by: 'u1',
    created_at: iso(30),
    updated_at: iso(30),
    criteria: [],
    progress: [],
  },
];

const model = {
  systems: [{ id: 'sys_payments', name: 'Payments', position: { x: 0, y: 0 } }],
  containers: [
    { id: 'ctr_api', name: 'Billing API', systemId: 'sys_payments', technology: 'nestjs', position: { x: 0, y: 0 } },
    { id: 'ctr_db', name: 'Billing DB', systemId: 'sys_payments', technology: 'postgresql', position: { x: 0, y: 0 } },
    { id: 'ctr_worker', name: 'Outbox dispatcher', systemId: 'sys_payments', technology: 'nodejs', position: { x: 0, y: 0 } },
  ],
  components: [
    { id: 'cmp_post_subscriptions', name: 'POST /subscriptions', containerId: 'ctr_api', kind: 'endpoint', method: 'POST', endpoint: '/subscriptions', position: { x: 0, y: 0 } },
    { id: 'cmp_ws_billing', name: 'WS /ws/billing', containerId: 'ctr_api', kind: 'endpoint', method: 'WS', endpoint: '/ws/billing', position: { x: 0, y: 0 } },
    { id: 'cmp_plans', name: 'Plan catalog', containerId: 'ctr_api', position: { x: 0, y: 0 } },
  ],
  codeElements: [],
  viewLevel: 'system',
};

/** The version diff the create form offers its scope from. */
const diff = {
  from: { id: 'snap_2', name: 'v3 — billing split' },
  to: { id: 'snap_3', name: 'v4 — subscriptions' },
  totals: { added: 3, removed: 0, changed: 2, moved: 1 },
  elements: {
    added: [
      { id: 'cmp_post_subscriptions', name: 'POST /subscriptions', level: 'component' },
      { id: 'cmp_ws_billing', name: 'WS /ws/billing', level: 'component' },
      { id: 'ctr_worker', name: 'Outbox dispatcher', level: 'container' },
    ],
    changed: [
      { id: 'ctr_api', name: 'Billing API', level: 'container' },
      { id: 'ctr_db', name: 'Billing DB', level: 'container' },
    ],
    removed: [],
  },
  connections: { added: [], changed: [], removed: [] },
  sequences: { added: [], changed: [], removed: [] },
  docs: { added: [], changed: [], removed: [] },
  flows: { added: [], changed: [], removed: [] },
};

const json = (body: unknown) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );

window.fetch = ((input: RequestInfo | URL) => {
  const url = String(
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  );
  if (url.includes('/change-sets')) return json({ changeSets });
  if (url.includes('/versions/diff')) return json(diff);
  if (url.includes('/snapshots/')) return json({ snapshot: snapshots[0], model, docs: [] });
  if (url.includes('/snapshots')) return json({ snapshots, last_snapshot_model: null });
  return json({});
}) as typeof window.fetch;

useFlatC4Store.getState().setModel(model as never);

/** The canvas the window floats over in the editor. */
function Canvas({ children }: { children: React.ReactNode }) {
  const { chrome } = useColorMode();
  return (
    <Box
      h="100vh"
      w="100vw"
      bg="bg.canvas"
      backgroundImage={`radial-gradient(${chrome.canvasDot} ${CANVAS_DOT_SIZE / 2}px, transparent ${CANVAS_DOT_SIZE / 2}px)`}
      backgroundSize={`${CANVAS_DOT_GAP}px ${CANVAS_DOT_GAP}px`}
      p="12px"
    >
      <Box h="100%" overflow="hidden">
        {children}
      </Box>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <ColorModeProvider>
    <Canvas>
      <ChangeSetsPage
        projectId="p1"
        canWrite
        initialSelectedId={scene === 'catalog' ? 'cs_7f31ab90c2' : null}
        onRequestClose={() => undefined}
      />
    </Canvas>
  </ColorModeProvider>
);

/*
 * The scene drives itself, so the capture script only has to wait: open the
 * commits, or open the create form and fill it in. `data-scene="ready"` on the
 * root element is the signal that the shot can be taken.
 */
const nativeValue = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  Object.getOwnPropertyDescriptor(proto.prototype, 'value')!.set!.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

const settle = (ms: number) => new Promise((r) => setTimeout(r, ms));
const byText = (text: string) =>
  [...document.querySelectorAll('button, div[role="button"]')].find((el) =>
    (el.textContent || '').includes(text)
  ) as HTMLElement | undefined;
const inputWithPlaceholder = (prefix: string) =>
  ([...document.querySelectorAll('input')] as HTMLInputElement[]).filter((i) =>
    i.placeholder?.startsWith(prefix)
  );

async function direct() {
  await settle(700);
  if (scene === 'catalog') {
    (document.querySelector('[data-testid="change-set-commits-toggle"]') as HTMLElement)?.click();
  }
  if (scene === 'new') {
    (document.querySelector('[data-testid="change-sets-new"]') as HTMLElement)?.click();
    await settle(500);
    const intent = document.querySelector('textarea');
    if (intent) nativeValue(intent, 'Introduce subscription creation');
    byText('Billing API')?.click();
    await settle(200);
    const fill = (placeholder: string, value: string) => {
      const [field] = inputWithPlaceholder(placeholder);
      if (field) nativeValue(field, value);
    };
    fill('NestJS', 'NestJS');
    fill('PostgreSQL', 'PostgreSQL');
    fill('outbox, idempotency', 'outbox, idempotency');
    fill('main@8af31cd', 'main@8af31cd');
    await settle(150);
    const [criterion] = inputWithPlaceholder('Endpoint returns 201');
    if (criterion) {
      nativeValue(criterion, 'POST /subscriptions returns 201 with the created subscription');
    }
    byText('Add criterion')?.click();
    await settle(200);
    const second = inputWithPlaceholder('Endpoint returns 201').pop();
    if (second) nativeValue(second, 'A repeated Idempotency-Key returns the first result');
  }
  await settle(400);
  document.documentElement.setAttribute('data-scene', 'ready');
}

void direct();
