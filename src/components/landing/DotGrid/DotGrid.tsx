import { Box } from '@chakra-ui/react';
import { useMemo } from 'react';

/**
 * The dotted ground behind a hero, matching the canvas in the editor — which
 * is the whole point of it: the marketing page and the product are the same
 * surface. Shared so the integrations page stands on the same one.
 */
export default function DotGrid({ dotColor }: { dotColor: string }) {
  const backgroundImage = useMemo(() => {
    const encoded = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="2" fill="${dotColor}"/></svg>`
    );
    return `url("data:image/svg+xml,${encoded}")`;
  }, [dotColor]);

  return (
    <Box
      position="absolute"
      inset="0"
      style={{
        backgroundImage,
        backgroundSize: '20px 20px',
        backgroundRepeat: 'repeat',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)',
      }}
      pointerEvents="none"
      aria-hidden
    />
  );
}
