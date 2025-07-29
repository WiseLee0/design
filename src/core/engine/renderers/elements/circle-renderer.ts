import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { SceneNode } from '@/core/models';
import { BaseRenderer } from './base-renderer';

/**
 * 圆形渲染器
 */
export class CircleRenderer extends BaseRenderer {
  canRender(node: SceneNode): boolean {
    return node.type === 'CIRCLE';
  }

  renderShape(_canvasKit: CanvasKit, canvas: Canvas, node: SceneNode, paint: Paint): void {
    // 计算圆心和半径
    const centerX = node.width / 2;
    const centerY = node.height / 2;
    const radius = Math.min(node.width, node.height) / 2;

    // 绘制圆形
    canvas.drawCircle(centerX, centerY, radius, paint);
  }
}