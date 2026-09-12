/**
 * An unattended tab must not keep its own session alive.
 *
 * The server extends the session on any authenticated request unless the
 * request says it was not the person's doing. That rule used to be applied by
 * each caller, and only the auth heartbeat ever remembered — so the thread poll
 * (every five seconds, while a project is open) renewed the cookie all night
 * and the idle timeout could never fire. The client now decides centrally, from
 * real input, which is what these assertions are about: not that one endpoint
 * behaves, but that an arbitrary one does.
 *
 * Input arrives as an explicit timestamp rather than a synthetic event: two
 * bursts in the same millisecond are genuinely one burst, and a test that could
 * not tell them apart would be testing the clock.
 */
const PROBE = 'X-Session-Probe';

type Loaded = {
  api: typeof import('../index').api;
  resetUserActivity: typeof import('@shared/lib/userActivity').resetUserActivity;
};

/** A fresh module registry per test — the slide state lives for a tab's life. */
async function load(): Promise<Loaded> {
  jest.resetModules();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ threads: [] }),
  }) as unknown as typeof fetch;
  const activity = await import('@shared/lib/userActivity');
  const client = await import('../index');
  return { api: client.api, resetUserActivity: activity.resetUserActivity };
}

function probeOf(call: number): string | undefined {
  const [, init] = (global.fetch as jest.Mock).mock.calls[call];
  return (init?.headers as Record<string, string> | undefined)?.[PROBE];
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('session probe', () => {
  it('marks polls from an untouched tab as idle', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(0);

    await api.listThreads('p1');
    await api.listThreads('p1');

    expect(probeOf(0)).toBe('idle');
    expect(probeOf(1)).toBe('idle');
  });

  it('lets a request the person caused extend the session', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(1000);

    await api.listThreads('p1');

    expect(probeOf(0)).toBeUndefined();
  });

  it('slides once per burst of input, not once per request', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(1000);

    await api.listThreads('p1');
    /* The polls that follow the click are still the machine talking. */
    await api.listThreads('p1');
    await api.listThreads('p1');

    expect(probeOf(0)).toBeUndefined();
    expect(probeOf(1)).toBe('idle');
    expect(probeOf(2)).toBe('idle');
  });

  it('slides again after the person comes back', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(1000);
    await api.listThreads('p1');
    await api.listThreads('p1');

    resetUserActivity(2000);
    await api.listThreads('p1');

    expect(probeOf(1)).toBe('idle');
    expect(probeOf(2)).toBeUndefined();
  });

  it('treats opening the app as the person arriving', async () => {
    /* No resetUserActivity: the module starts from the moment of load, which
       is someone navigating to the app. */
    const { api } = await load();

    await api.listThreads('p1');

    expect(probeOf(0)).toBeUndefined();
  });

  it('honours a heartbeat that declares itself idle despite recent input', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(1000);

    await api.me({ idle: true });

    expect(probeOf(0)).toBe('idle');
  });

  it('leaves the heartbeat to the shared rule when it does not declare one', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(1000);

    await api.me();

    expect(probeOf(0)).toBeUndefined();
  });

  it('does not let a forced-idle heartbeat consume the input behind it', async () => {
    const { api, resetUserActivity } = await load();
    resetUserActivity(1000);

    await api.me({ idle: true });
    /* The click is still unspent: the next real request must slide on it. */
    await api.listThreads('p1');

    expect(probeOf(0)).toBe('idle');
    expect(probeOf(1)).toBeUndefined();
  });
});
