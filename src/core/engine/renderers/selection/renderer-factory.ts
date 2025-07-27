import type { Canvas, CanvasKit } from "canvaskit-wasm";
import { GhostRenderer } from "./ghost-renderer";
import { SelectionRenderer } from "./selection-renderer";
import type { ISelectionRenderer } from "./type";

/**
 * 选择框渲染器工厂
 */
export class SelectionRendererFactory {
    private renderers: ISelectionRenderer[] = [
        new GhostRenderer(),
        new SelectionRenderer(),
    ];

    execture(CK: CanvasKit, canvas: Canvas): void {
        this.renderers.forEach(renderer => {
            if (renderer.canRender()) {
                renderer.render(CK, canvas)
            }
        })
    }
}