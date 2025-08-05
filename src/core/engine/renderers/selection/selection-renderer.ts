import type { CanvasKit, Canvas } from 'canvaskit-wasm';
import { THEME_COLOR, type XYWH } from '@/core/models';
import { getSelectionState } from '@/store/selection';
import type { ISelectionRenderer } from './type';
import { getViewportState } from '@/store/viewport';
import { findByIds } from '@/store/project';

export class SelectionRenderer implements ISelectionRenderer {
    canRender(): boolean {
        const selectionBoxs = getSelectionState('selectionBoxs');
        return selectionBoxs?.length > 0
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const scale = getViewportState('scale');
        const selectionBoxs = getSelectionState('selectionBoxs');

        // 选择框使用主题色
        const strokePaint = new CK.Paint();
        strokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        strokePaint.setStyle(CK.PaintStyle.Stroke);
        strokePaint.setStrokeWidth(1 / scale);

        // 小矩形边框使用主题色
        const cornerStrokePaint = new CK.Paint();
        cornerStrokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        cornerStrokePaint.setStyle(CK.PaintStyle.Stroke);
        cornerStrokePaint.setStrokeWidth(1 / scale);

        // 绘制四个角的小矩形
        const cornerFillPaint = new CK.Paint();
        cornerFillPaint.setColor(CK.Color(255, 255, 255, 1));
        cornerFillPaint.setStyle(CK.PaintStyle.Fill);



        /** 绘制内层元素的选中框 */
        const ids = getSelectionState('ids');
        const nodes = findByIds(ids)
        for (const node of nodes) {
            const path = node.getHoverPath()
            canvas.save()
            const [a, b, c, d, e, f] = node.getAbsoluteMatrix();
            canvas.concat([
                a, c, e,
                b, d, f,
                0, 0, 1
            ]);
            canvas.drawPath(path, strokePaint)
            canvas.restore()
        }

        /** 绘制最外层的选中框 */
        for (const item of selectionBoxs) {
            canvas.save()
            const [a, b, c, d, e, f] = item.matrix;
            canvas.concat([
                a, c, e,
                b, d, f,
                0, 0, 1
            ]);
            const box = [0, 0, item.width, item.height] as XYWH
            // 绘制选择框边框

            canvas.drawRect(CK.XYWHRect(...box), strokePaint);

            // 计算小矩形的大小
            const handleSize = 6 / scale;

            // 定义四个角的矩形
            const cornerRects = [
                // 左上角
                CK.XYWHRect(box[0] - handleSize / 2, box[1] - handleSize / 2, handleSize, handleSize),
                // 右上角
                CK.XYWHRect(box[0] + box[2] - handleSize / 2, box[1] - handleSize / 2, handleSize, handleSize),
                // 左下角
                CK.XYWHRect(box[0] - handleSize / 2, box[1] + box[3] - handleSize / 2, handleSize, handleSize),
                // 右下角
                CK.XYWHRect(box[0] + box[2] - handleSize / 2, box[1] + box[3] - handleSize / 2, handleSize, handleSize)
            ];

            // 绘制所有角落的小矩形
            for (const rect of cornerRects) {
                canvas.drawRect(rect, cornerFillPaint);
                canvas.drawRect(rect, cornerStrokePaint);
            }


            canvas.restore()
        }


        // 释放资源
        strokePaint.delete();
        cornerFillPaint.delete();
        cornerStrokePaint.delete();
    }
}