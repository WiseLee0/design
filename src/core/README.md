# 设计工具核心架构

这是一个基于 CanvasKit 的高性能设计工具核心系统，支持元素渲染、交互操作和状态管理。

## 🏗️ 架构概览

```
src/core/
├── models/           # 数据模型层
│   ├── elements/     # 元素相关模型
│   │   ├── type.ts   # 类型定义
│   │   └── factories.ts # 元素工厂
│   └── index.ts
├── engine/           # 渲染引擎层
│   ├── renderers/    # 渲染器模块
│   │   ├── base-renderer.ts      # 基础渲染器
│   │   ├── rectangle-renderer.ts # 矩形渲染器
│   │   ├── circle-renderer.ts    # 圆形渲染器
│   │   ├── renderer-factory.ts   # 渲染器工厂
│   │   ├── canvas-renderer.ts    # 主渲染器
│   │   └── index.ts
│   ├── interaction/  # 交互系统
│   │   ├── viewport/ # 视口管理
│   │   │   └── index.ts
│   │   ├── events/   # 事件处理
│   │   │   └── event-handler.ts
│   │   └── interaction-controller.ts
│   ├── index.ts
│   └── usage-example.ts
├── commands/         # 命令系统（待实现）
└── history/          # 历史记录（待实现）
```

## 🎯 核心功能

### 1. 渲染系统
- **通用渲染架构**: 基于工厂模式的可扩展渲染器系统
- **高性能渲染**: 使用 CanvasKit-WASM 进行硬件加速渲染
- **多元素支持**: 目前支持矩形和圆形，易于扩展新元素类型

### 2. 交互系统
- **视口管理**: 支持缩放、平移、重置等视口操作
- **鼠标交互**: 滚轮缩放、拖拽平移
- **触摸支持**: 移动端双指缩放和单指拖拽
- **键盘快捷键**: Ctrl+0重置、Ctrl+±缩放

### 3. 数据模型
- **类型安全**: 完整的 TypeScript 类型定义
- **元素工厂**: 便捷的元素创建方法
- **样式系统**: 支持颜色、透明度、混合模式

## 🚀 快速开始

### 1. 初始化系统

```typescript
import { CanvasRenderer } from '@/core/engine';

// 确保 HTML 中有 <canvas id="main-canvas"></canvas>
await CanvasRenderer.init();
```

### 2. 创建元素

```typescript
import { ElementFactory } from '@/core/models/elements/factories';

// 创建基础形状
const rect = ElementFactory.createRectangle(10, 10, 100, 50);
const circle = ElementFactory.createCircle(200, 200, 30);

// 创建预设颜色的形状
const redSquare = ElementFactory.createColoredRectangle(50, 50, 80, 80, '红色');
const blueCircle = ElementFactory.createColoredCircle(300, 100, 40, '蓝色');

// 创建复杂图案
const grid = ElementFactory.createGrid(10, 10, 3, 4, 50, 10, 'CIRCLE');
const spiral = ElementFactory.createSpiral(400, 300, 50, 3, 0.3, 8);
```

### 3. 交互操作

```typescript
// 重置视口
CanvasRenderer.resetViewport();

// 适应内容大小
CanvasRenderer.fitToContent();

// 设置缩放限制
CanvasRenderer.setScaleLimits(0.1, 5.0);

// 获取鼠标世界坐标
const worldPos = CanvasRenderer.getWorldCoordinates(event.clientX, event.clientY);
```

## 🎨 元素类型

### 当前支持的元素类型

#### 矩形 (RECTANGLE)
```typescript
interface DesignElement {
    type: "RECTANGLE";
    matrix: number[];      // 变换矩阵 [a, b, c, d, e, f]
    width: number;         // 宽度
    height: number;        // 高度
    visible: boolean;      // 可见性
    opacity: number;       // 透明度 0-1
    fillPaints: FillPaint[]; // 填充样式
}
```

#### 圆形 (CIRCLE)
```typescript
interface DesignElement {
    type: "CIRCLE";
    matrix: number[];      // 变换矩阵
    width: number;         // 直径
    height: number;        // 直径
    visible: boolean;      // 可见性
    opacity: number;       // 透明度
    fillPaints: FillPaint[]; // 填充样式
}
```

### 填充样式
```typescript
interface FillPaint {
    color: DesignColor;    // RGBA 颜色 [r, g, b, a] (0-1范围)
    visible: boolean;      // 填充可见性
    blendMode: DesignBlendMode; // 混合模式
}
```

## 🔧 扩展指南

### 添加新的元素类型

1. **更新类型定义**
```typescript
// src/core/models/elements/type.ts
export interface DesignElement {
    type: "RECTANGLE" | "CIRCLE" | "TEXT"; // 添加新类型
    // ... 其他属性
}
```

2. **创建渲染器**
```typescript
// src/core/engine/renderers/text-renderer.ts
export class TextRenderer extends BaseRenderer {
    canRender(element: DesignElement): boolean {
        return element.type === 'TEXT';
    }
    
    renderShape(canvasKit: CanvasKit, canvas: Canvas, element: DesignElement, paint: Paint): void {
        // 实现文本渲染逻辑
    }
}
```

3. **注册渲染器**
```typescript
// src/core/engine/renderers/renderer-factory.ts
private renderers: IElementRenderer[] = [
    new RectangleRenderer(),
    new CircleRenderer(),
    new TextRenderer(), // 添加新渲染器
];
```

4. **添加工厂方法**
```typescript
// src/core/models/elements/factories.ts
static createText(x: number, y: number, text: string, fontSize: number): DesignElement {
    // 实现文本元素创建逻辑
}
```

## 🎮 交互功能

### 鼠标操作
- **滚轮**: 以鼠标位置为中心缩放
- **左键拖拽**: 平移视口
- **中键拖拽**: 平移视口

### 触摸操作
- **单指拖拽**: 平移视口
- **双指缩放**: 缩放视口

### 键盘快捷键
- **Ctrl+0**: 重置视口
- **Ctrl+=**: 放大
- **Ctrl+-**: 缩小

## 📊 性能特性

- **硬件加速**: 使用 WebGL 进行渲染
- **增量更新**: 只在状态变化时重新渲染
- **视口裁剪**: 只渲染可见区域内的元素
- **内存管理**: 自动管理 CanvasKit 资源

## 🔮 未来规划

- [ ] 文本元素支持
- [ ] 图片元素支持
- [ ] 路径和贝塞尔曲线
- [ ] 图层系统
- [ ] 选择和编辑功能
- [ ] 命令系统和撤销/重做
- [ ] 导入/导出功能
- [ ] 性能优化和批量渲染

## 🤝 贡献指南

1. 遵循现有的架构模式
2. 保持类型安全
3. 添加适当的注释和文档
4. 考虑性能影响
5. 测试新功能的兼容性