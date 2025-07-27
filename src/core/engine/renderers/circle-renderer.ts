import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { DesignElement } from '@/core/models';
import { BaseRenderer } from './base-renderer';

/**
 * 圆形渲染器
 */
export class CircleRenderer extends BaseRenderer {
  canRender(element: DesignElement): boolean {
    return element.type === 'CIRCLE';
  }

  renderShape(_canvasKit: CanvasKit, canvas: Canvas, element: DesignElement, paint: Paint): void {
    // 计算圆心和半径
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    const radius = Math.min(element.width, element.height) / 2;
    
    // 绘制圆形
    canvas.drawCircle(centerX, centerY, radius, paint);
  }
}