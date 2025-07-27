import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { DesignElement } from '@/core/models';
import { BaseRenderer } from './base-renderer';

/**
 * 矩形渲染器
 */
export class RectangleRenderer extends BaseRenderer {
  canRender(element: DesignElement): boolean {
    return element.type === 'RECTANGLE';
  }

  renderShape(canvasKit: CanvasKit, canvas: Canvas, element: DesignElement, paint: Paint): void {
    // 创建矩形区域
    const rect = canvasKit.XYWHRect(0, 0, element.width, element.height);
    
    // 绘制填充矩形
    canvas.drawRect(rect, paint);
  }
}