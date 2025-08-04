import { getSelectionState } from "@/store/selection";
import type { CanvasKit, Canvas } from "canvaskit-wasm";
import type { ISelectionRenderer } from "./type";
import { getProjectState } from "@/store/project";
import { THEME_COLOR } from "@/core/models";
import { getViewportState } from "@/store/viewport";

export class HoverRenderer implements ISelectionRenderer {
    canRender(): boolean {
        const hoverId = getSelectionState('hoverId');
        return Boolean(hoverId?.length)
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const scale = getViewportState('scale');
        const hoverId = getSelectionState('hoverId')!;
        const sceneTree = getProjectState('sceneTree');
        const node = sceneTree.findById(hoverId);
        if (!node) return;
        canvas.save()
        const hoverPaint = new CK.Paint();
        const [a, b, c, d, e, f] = node.getAbsoluteMatrix()
        canvas.concat([
            a, c, e,
            b, d, f,
            0, 0, 1
        ])
        hoverPaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        hoverPaint.setStyle(CK.PaintStyle.Stroke);
        hoverPaint.setStrokeWidth(2 / scale);
        const path = node.getStrokePath();
        canvas.drawPath(path, hoverPaint);
        canvas.restore()
        hoverPaint.delete();
    }

}