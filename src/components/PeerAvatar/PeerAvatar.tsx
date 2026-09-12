import { Box, Portal, Tooltip } from '@chakra-ui/react';
import { memo } from 'react';
import { peerIconForId } from './helpers';
import type { PeerAvatarProps } from './types';

function PeerAvatar({ clientId, name, color, size = 28, onClick }: PeerAvatarProps) {
  const Icon = peerIconForId(clientId);
  const title = onClick ? `${name} — click to follow` : name;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Box
          as={onClick ? 'button' : 'span'}
          {...(onClick ? { type: 'button' as const } : {})}
          onClick={onClick}
          aria-label={title}
          w={`${size}px`}
          h={`${size}px`}
          borderRadius="full"
          bg={color}
          borderWidth="2px"
          borderColor={color}
          boxShadow="0 0 0 1px rgba(0,0,0,0.25)"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          p="0"
          m="0"
          cursor={onClick ? 'pointer' : 'default'}
          color="#0a1929"
          flexShrink={0}
          transition="transform 0.15s ease, box-shadow 0.15s ease"
          _hover={
            onClick
              ? {
                  transform: 'scale(1.12)',
                  boxShadow: `0 0 0 2px ${color}, 0 2px 8px rgba(0,0,0,0.35)`,
                }
              : undefined
          }
          _focusVisible={{
            outline: `2px solid ${color}`,
            outlineOffset: '2px',
          }}
        >
          <Icon size={Math.round(size * 0.55)} strokeWidth={2.4} aria-hidden />
        </Box>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            {title}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

export default memo(PeerAvatar);
