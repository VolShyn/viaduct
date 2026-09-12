import { useColorMode } from '@contexts/ColorModeContext';
import { useGlassSurface } from '@theme/glassSurfaces';
import { FlagEu, FlagRu, FlagUs } from '@components/flags/RegionFlags';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { CLOUDTIPS_URL, STRIPE_URL } from './constants';

export default function DonateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const glass = useGlassSurface();
  const { chrome } = useColorMode();
  const fgColor = chrome.textPrimary;
  const fgMuted = chrome.textMuted;

  if (!open) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0,0,0,0.45)"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <Box
        {...glass.sidePanel}
        borderRadius="16px"
        p="28px"
        w="360px"
        maxW="calc(100vw - 32px)"
        position="relative"
        onClick={(e) => e.stopPropagation()}
        style={{ color: fgColor }}
      >
        <Box
          as="button"
          position="absolute"
          top="14px"
          right="14px"
          display="inline-flex"
          style={{ color: fgMuted, cursor: 'pointer' }}
          onClick={onClose}
        >
          <X size={16} />
        </Box>

        <Text fontWeight="700" fontSize="lg" mb="6px" style={{ color: fgColor }}>
          Support Viaduct
        </Text>
        <Text fontSize="sm" mb="20px" style={{ color: fgMuted }}>
          Choose your region to donate
        </Text>

        <VStack gap="10px" align="stretch">
          <Box {...glass.floatBar} borderRadius="12px" overflow="hidden">
            <a
              href={STRIPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', textDecoration: 'none', color: fgColor }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              <HStack gap="14px" p="14px">
                <HStack gap="4px" flexShrink={0}>
                  <FlagEu />
                  <FlagUs />
                </HStack>
                <Box>
                  <Text fontWeight="700" fontSize="sm" style={{ color: fgColor }}>
                    EU / USA
                  </Text>
                  <Text fontSize="xs" style={{ color: fgMuted }}>
                    Pay via Stripe
                  </Text>
                </Box>
              </HStack>
            </a>
          </Box>

          <Box {...glass.floatBar} borderRadius="12px" overflow="hidden">
            <a
              href={CLOUDTIPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', textDecoration: 'none', color: fgColor }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              <HStack gap="14px" p="14px">
                <Box flexShrink={0} lineHeight={0}>
                  <FlagRu />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="sm" style={{ color: fgColor }}>
                    Russia
                  </Text>
                  <Text fontSize="xs" style={{ color: fgMuted }}>
                    Pay via CloudTips
                  </Text>
                </Box>
              </HStack>
            </a>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
