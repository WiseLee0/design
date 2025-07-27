
export interface DesignElement {
    type: "RECTANGLE" | "CIRCLE"
    matrix: number[];
    width: number;
    height: number;
    fillPaints: FillPaint[];
    visible: boolean;
    opacity: number;
}

export type DesignColor = [number, number, number, number]

export type DesignBlendMode = "NORMAL"

export interface FillPaint {
    color: DesignColor,
    visible: boolean,
    blendMode: DesignBlendMode
}