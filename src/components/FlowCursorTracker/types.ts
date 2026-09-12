import type { ReactNode } from 'react';

export type FlowCursorTrackerProps = {
  enabled: boolean;
  setLocalCursor: (cursor: { x: number; y: number } | null) => void;
  children: ReactNode;
};
