import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { FillPaint, SceneNode } from '@/core/models';

/**
 * 元素渲染器接口
 */
export interface IElementRenderer {
    /**
     * 判断是否可以渲染该元素
     */
    canRender(element: SceneNode): boolean;

    /**
     * 渲染元素
     */
    render(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode): void;
}

/**
 * 基础渲染器抽象类
 * 提供通用的变换、样式处理逻辑
 */
export abstract class BaseRenderer implements IElementRenderer {
    abstract canRender(node: SceneNode): boolean;
    abstract renderShape(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode, paint: Paint): void;

    render(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode): void {
        if (!node.visible) return;

        canvas.save();

        // 应用变换矩阵
        this.applyTransform(canvas, node.matrix);

        // 处理填充样式
        node.fillPaints.forEach(fillPaint => {
            if (fillPaint.visible) {
                const paint = this.createPaint(canvasKit, fillPaint);
                this.renderShape(canvasKit, canvas, node, paint);
                paint.delete();
            }
        });

        canvas.restore();
    }

    /**
     * 应用变换矩阵
     * matrix: [a, b, c, d, e, f] 对应 CSS transform matrix
     */
    protected applyTransform(canvas: Canvas, matrix: number[]): void {
        if (matrix.length === 6) {
            const [a, b, c, d, e, f] = matrix;
            // CanvasKit 使用 3x3 矩阵
            canvas.concat([
                a, c, e,
                b, d, f,
                0, 0, 1
            ]);
        }
    }

    /**
     * 创建画笔并应用样式
     */
    protected createPaint(canvasKit: CanvasKit, fillPaint: FillPaint): Paint {
        const paint = new canvasKit.Paint();
        paint.setColor([fillPaint.color[0], fillPaint.color[1], fillPaint.color[2], fillPaint.color[3]]);
        this.applyBlendMode(canvasKit, paint, fillPaint.blendMode);
        return paint;
    }

    /**
     * 应用混合模式
     */
    protected applyBlendMode(canvasKit: CanvasKit, paint: Paint, blendMode: string): void {
        switch (blendMode) {
            case 'NORMAL':
                paint.setBlendMode(canvasKit.BlendMode.SrcOver);
                break;
            default:
                paint.setBlendMode(canvasKit.BlendMode.SrcOver);
        }
    }
}