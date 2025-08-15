import type { DesignElement } from "@/core/models";
import { getProjectState, setProjectState } from "@/store/project";

const PRESET_COLORS: [number, number, number, number][] = [
  [0.42, 0.65, 0.89, 1],
  [0.47, 0.87, 0.68, 1],
  [0.98, 0.62, 0.55, 1],
  [0.71, 0.52, 0.87, 0.75],
  [0.94, 0.83, 0.57, 1],
  [0.18, 0.24, 0.43, 0.6],
  [0.91, 0.49, 0.24, 1],
  [0.75, 0.47, 0.53, 0.65],
];

export const benchmarkGenerateRndElements = (count: number) => {
  const sceneTree = getProjectState("sceneTree");

  const rnd = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const createRandomElement = (i: number): DesignElement => {
    const isRect = Math.random() < 0.5;
    const w = rnd(20, 160);
    const h = rnd(20, 160);
    const x = rnd(0, 1200);
    const y = rnd(0, 1000);
    const rotation = Math.random() * 360;
    const angle = (rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const color =
      PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    return {
      id: i.toString(),
      type: isRect ? "RECTANGLE" : "CIRCLE",
      matrix: [cos, sin, -sin, cos, x, y],
      width: isRect ? w : Math.max(w, h),
      height: isRect ? h : Math.max(w, h),
      visible: true,
      fillPaints: [
        {
          color,
          visible: true,
          blendMode: "NORMAL",
        },
      ],
    };
  };

  const generated: DesignElement[] = Array.from({ length: count }, (_, i) =>
    createRandomElement(i)
  );

  setProjectState({ mockElements: generated });
  sceneTree?.build(generated);
};

export const benchmarkGenerateElements = (count: number) => {
  const sceneTree = getProjectState("sceneTree");

  const generated: DesignElement[] = generateElements(100, 100, count)

  setProjectState({ mockElements: generated });
  sceneTree?.build(generated);
};


function generateElements(elementWidth: number, elementHeight: number, count: number) {
  const elements: DesignElement[] = [];
  const itemSize = elementWidth;
  const gap = 10;
  const itemWithGap = itemSize + gap;
  const containerWidth = Math.sqrt(count) * (itemSize + gap);
  const cols = Math.floor(containerWidth / itemWithGap);
  const actualCols = Math.max(1, cols); // 确保至少有一列

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / actualCols);
    const col = i % actualCols;
    const color =
      PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    const x = col * itemWithGap;
    const y = row * itemWithGap;

    elements.push({
      id: i.toString(),
      type: 'RECTANGLE',
      matrix: [1, 0, 0, 1, x, y],
      width: elementWidth,
      height: elementHeight,
      visible: true,
      fillPaints: [
        {
          color,
          visible: true,
          blendMode: "NORMAL",
        },
      ],
    });
  }

  return elements;
}