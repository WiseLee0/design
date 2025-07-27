import type { CanvasKit, Canvas } from 'canvaskit-wasm';
import { THEME_COLOR } from '@/core/models';
import { getSelectionState } from '@/store/selection';
import type { ISelectionRenderer } from './type';

export class SelectionRenderer implements ISelectionRenderer {
    canRender(): boolean {
        const selectionBoxs = getSelectionState('selectionBoxs');
        return selectionBoxs?.length > 0
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const selectionBoxs = getSelectionState('selectionBoxs');
        for (const box of selectionBoxs) {
            const strokePaint = new CK.Paint();
            strokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
            strokePaint.setStyle(CK.PaintStyle.Stroke);
            strokePaint.setStrokeWidth(1);
            canvas.drawRect(CK.XYWHRect(...box), strokePaint);
            strokePaint.delete();
        }
    }
}