import type { DesignColor, DesignElement } from "..";

export class ElementFactory {
    // 创建矩形
    static createRectangle(x: number, y: number, width: number, height: number, color?: DesignColor): DesignElement {
        return {
            type: "RECTANGLE" as const,
            matrix: [1, 0, 0, 1, x, y],
            width,
            height,
            visible: true,
            opacity: 1,
            fillPaints: [{
                color: color || [0, 0, 0, 1],
                visible: true,
                blendMode: "NORMAL" as const
            }]
        };
    }

    // 创建圆形
    static createCircle(x: number, y: number, radius: number, color?: DesignColor): DesignElement {
        return {
            type: "CIRCLE" as const,
            matrix: [1, 0, 0, 1, x, y],
            width: radius * 2,
            height: radius * 2,
            visible: true,
            opacity: 1,
            fillPaints: [{
                color: color || [0, 0, 0, 1],
                visible: true,
                blendMode: "NORMAL" as const
            }]
        };
    }
}