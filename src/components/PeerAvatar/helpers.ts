import type { LucideIcon } from 'lucide-react';
import { PEER_ICONS } from './constants';

export function peerIconForId(clientId: number): LucideIcon {
  return PEER_ICONS[Math.abs(clientId) % PEER_ICONS.length];
}
