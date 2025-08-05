import type { DesignElement } from './type';
import type { SceneNode } from './scene-node';
import { vec2 } from 'gl-matrix';
import type { BoundingBox } from '@/core/engine/collision';
import { hitMatrixNodeTest } from '@/utils/hit-test';

/** 命中测试策略集合 */
export const hitPointStrategies: Record<DesignElement['type'], (pt: vec2, node: SceneNode) => boolean> = {
  RECTANGLE: (p, n) => p[0] >= 0 && p[0] <= n.width && p[1] >= 0 && p[1] <= n.height,
  CIRCLE: (p, n) => {
    const cx = n.width / 2;
    const cy = n.height / 2;
    const r = n.width / 2;
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    return dx * dx + dy * dy <= r * r;
  },
  ROOT: () => false,
};

export const hitGhostStrategies: Record<DesignElement['type'], (box: BoundingBox, node: SceneNode) => boolean> = {
  RECTANGLE: (box, node) => {
    return hitMatrixNodeTest({ matrix: [1, 0, 0, 1, box.x, box.y], width: box.width, height: box.height }, {
      matrix: node.getAbsoluteMatrix(),
      width: node.width,
      height: node.height
    })
  },
  CIRCLE: (box, node) => {
    const b = node.getAbsoluteBoundingBox();
    return b.x < box.x + box.width &&
      b.x + b.width > box.x &&
      b.y < box.y + box.height &&
      b.y + b.height > box.y
  },
  ROOT: () => false,
}
