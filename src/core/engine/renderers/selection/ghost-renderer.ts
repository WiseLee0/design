import type { CanvasKit, Canvas } from 'canvaskit-wasm';
import { THEME_COLOR } from '@/core/models';
import { getSelectionState } from '@/store/selection';
import type { ISelectionRenderer } from './type';
import { getViewportState } from '@/store/viewport';

export class GhostRenderer implements ISelectionRenderer {
    canRender(): boolean {
        const ghostBox = getSelectionState('ghostBox');
        return ghostBox[2] !== 0 && ghostBox[3] !== 0
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const scale = getViewportState('scale');
        const ghostBox = getSelectionState('ghostBox');
        const fillPaint = new CK.Paint();
        fillPaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 0.15));
        fillPaint.setStyle(CK.PaintStyle.Fill);

        const strokePaint = new CK.Paint();
        strokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        strokePaint.setStyle(CK.PaintStyle.Stroke);
        strokePaint.setStrokeWidth(1 / scale);

        canvas.drawRect(CK.XYWHRect(...ghostBox), fillPaint);
        canvas.drawRect(CK.XYWHRect(...ghostBox), strokePaint);

        fillPaint.delete();
        strokePaint.delete();
    }
}