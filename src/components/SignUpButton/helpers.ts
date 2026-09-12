/** Goes into an email, so keep it to something that cannot be read as anything but a label. */
export function sanitizeSignupSource(source: string): string {
  return source.replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
}
