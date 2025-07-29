import type { DesignElement } from './type';
import type { SceneNode } from './scene-node';
import { vec2 } from 'gl-matrix';

/** 命中测试策略集合 */
export const hitStrategies: Record<DesignElement['type'], (pt: vec2, node: SceneNode) => boolean> = {
  RECTANGLE: (p, n) => p[0] >= 0 && p[0] <= n.width && p[1] >= 0 && p[1] <= n.height,
  CIRCLE: (p, n) => {
    const cx = n.width / 2;
    const cy = n.height / 2;
    const r = n.width / 2;
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    return dx * dx + dy * dy <= r * r;
  },
  GROUP: () => false,
  ROOT: () => false,
};