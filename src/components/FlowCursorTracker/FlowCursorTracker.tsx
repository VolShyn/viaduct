import { Box } from '@chakra-ui/react';
import { useReactFlow } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import { useWorkspaceOverlayCoversCanvas } from '@hooks/useWorkspaceOverlayCoversCanvas';
import type { FlowCursorTrackerProps } from './types';

/** Publishes pointer position in React Flow diagram coordinates. */
export default function FlowCursorTracker({
  enabled,
  setLocalCursor,
  children,
}: FlowCursorTrackerProps) {
  const { screenToFlowPosition } = useReactFlow();
  const overlayCoversCanvas = useWorkspaceOverlayCoversCanvas();
  const tracking = enabled && !overlayCoversCanvas;
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const lastSentRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (tracking) return;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingRef.current = null;
    lastSentRef.current = null;
    setLocalCursor(null);
  }, [tracking, setLocalCursor]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <Box
      position="relative"
      flex="1"
      minH={0}
      w="100%"
      overflow="hidden"
      onPointerMove={(e) => {
        if (!tracking) return;
        pendingRef.current = { x: e.clientX, y: e.clientY };
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const pending = pendingRef.current;
          if (!pending) return;
          const flow = screenToFlowPosition(pending);
          const last = lastSentRef.current;
          if (
            last &&
            Math.abs(last.x - flow.x) < 0.5 &&
            Math.abs(last.y - flow.y) < 0.5
          ) {
            return;
          }
          lastSentRef.current = flow;
          setLocalCursor(flow);
        });
      }}
      onPointerLeave={() => {
        if (!tracking) return;
        pendingRef.current = null;
        lastSentRef.current = null;
        setLocalCursor(null);
      }}
    >
      {children}
    </Box>
  );
}
