export interface DesignElement {
  id: string;
  type: "RECTANGLE" | "CIRCLE" | "ROOT";
  matrix: number[];
  width: number;
  height: number;
  fillPaints: FillPaint[];
  visible: boolean;
  children?: DesignElement[];
}

export type DesignColor = [number, number, number, number];
export type XYWH = [number, number, number, number];
export type DesignBlendMode = "NORMAL";

export interface FillPaint {
  color: DesignColor;
  visible: boolean;
  blendMode: DesignBlendMode;
}