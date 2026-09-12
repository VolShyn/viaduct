/**
 * The build-time switches, read through injected constants.
 *
 * Deliberately not `import.meta.env`: this module is pulled in by contexts the
 * unit tests mount, and `import.meta` is syntax the test runner cannot parse.
 * Vite defines these in `vite.config.ts`; anywhere else they are simply absent
 * and the fallbacks below apply.
 */
declare const __METRICS_DISABLED__: string | undefined;
declare const __DEV_BUILD__: boolean | undefined;

export function metricsDisabled(): boolean {
  const flag =
    typeof __METRICS_DISABLED__ === 'string' ? __METRICS_DISABLED__.toLowerCase() : '';
  return flag === 'true' || flag === '1';
}

/** True in a dev build — used only to warn about props that were dropped. */
export function isDevBuild(): boolean {
  return typeof __DEV_BUILD__ === 'boolean' ? __DEV_BUILD__ : false;
}
