import { Google } from '@ridemountainpig/svgl-react';

/**
 * Google's own G, from svgl — the same source the technology icons draw from,
 * so the mark stays whatever Google currently ships rather than a path copied
 * into this repo and left to age.
 *
 * It has no dark variant and needs none: the button under it is white in both
 * colour modes, which is what Google's sign-in guidelines ask for and why the
 * button does not carry our accent — four brand colours on orange go muddy.
 */
export default function GoogleMark({ size = 18 }: { size?: number }) {
  return <Google width={size} height={size} aria-hidden focusable="false" />;
}
