import type { Node } from '@xyflow/react';
import { buildGroupFrameNodes, moveGroupFrame } from '../elementGroups';

describe('moveGroupFrame', () => {
  it('shifts every member by the frame delta and leaves the rest alone', () => {
    const size = { measured: { width: 100, height: 50 } };
    const xs: Node[] = [
      { id: 'a', position: { x: 0, y: 0 }, data: { group: 'Payments' }, ...size },
      { id: 'b', position: { x: 200, y: 100 }, data: { group: 'payments' }, ...size },
      { id: 'c', position: { x: 500, y: 500 }, data: {}, ...size },
    ];
    const [frame] = buildGroupFrameNodes(xs);
    const to = { x: frame.position.x + 30, y: frame.position.y - 10 };
    expect(moveGroupFrame(frame.id, to, xs)).toEqual([
      { id: 'a', position: { x: 30, y: -10 } },
      { id: 'b', position: { x: 230, y: 90 } },
    ]);
  });
});
