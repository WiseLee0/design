import InitCanvasKit, {
  type Canvas,
  type CanvasKit,
  type Surface,
} from "canvaskit-wasm";
import { ElementRendererFactory } from "./elements/renderer-factory";
import { InteractionController } from "../interaction/interaction-controller";
import { SelectionRendererFactory } from "./selection/renderer-factory";
import { SceneTree } from "@/core/models/scene/scene-tree";
import { SceneNode } from "@/core/models/scene/scene-node";
import { hitMatrixNodeTest } from "@/utils/hit-test";
import { debounce } from "@/utils/debounce";
import { getPageState } from "@/store/page";

class Renderer {
  private canvasKit!: CanvasKit;
  private surface!: Surface;
  private elementFactory = new ElementRendererFactory();
  private interactionController?: InteractionController;
  private selectionFactory = new SelectionRendererFactory();
  private sceneTree!: SceneTree;
  private debounceResize!: () => void;

  // 脏标记驱动渲染
  private needsRender: boolean = false;
  private isRendering: boolean = false;

  async init(sceneTree: SceneTree) {
    const canvasKit = await InitCanvasKit({
      locateFile: (file) => `/node_modules/canvaskit-wasm/bin/${file}`,
    });
    this.canvasKit = canvasKit;

    this.debounceResize = debounce(this.resize.bind(this), 100);
    this.debounceResize();

    // 初始化交互控制器
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    this.interactionController = new InteractionController(canvas);

    // 监听视口变化，触发重新渲染
    this.interactionController.onViewportChange(() => {
      this.markNeedsRender();
    });

    // 初始构建场景树
    this.sceneTree = sceneTree;

    // 设置场景树变化回调
    this.sceneTree.onSceneChange(() => {
      this.markNeedsRender();
    });

    // 监听窗口大小变化
    window.addEventListener("resize", this.debounceResize);

    // 初始标记需要渲染
    this.markNeedsRender();
    this.renderLoop();

    return {
      canvasKit,
      surface: this.surface,
    };
  }

  private renderLoop() {
    const renderFrame = () => {
      if (this.needsRender && !this.isRendering) {
        this.render();
      }
      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
  }

  /**
   * 主渲染方法
   * 从 store 获取元素数据并渲染到画布
   */
  render() {
    if (!this.surface || this.isRendering) return;

    this.isRendering = true;
    this.needsRender = false;

    const canvas = this.surface.getCanvas();

    // 清空画布
    const fillPaint = getPageState("fillPaint");
    canvas.clear(fillPaint.color);

    // 保存当前变换状态
    canvas.save();

    // 应用视口变换
    if (this.interactionController) {
      const viewportState = this.interactionController.getViewportState();
      const transform = viewportState.transformMatrix;
      canvas.concat([
        transform[0],
        transform[1],
        transform[4],
        transform[2],
        transform[3],
        transform[5],
        0,
        0,
        1,
      ]);
    }

    // 渲染场景树
    this.renderNode(canvas, this.sceneTree.root);

    // 渲染选择框
    this.renderSelection();

    // 恢复变换状态
    canvas.restore();

    // 刷新画布
    this.surface.flush();

    this.isRendering = false;
  }

  /**
   * 渲染选择框
   */
  private renderSelection() {
    this.selectionFactory.execture(this.canvasKit, this.surface.getCanvas());
  }

  /**
   * 递归渲染单个节点及其子节点
   */
  private renderNode(canvas: Canvas, node: SceneNode): void {
    if (!node.visible) return;
    // 视口剔除
    if (this.shouldViewportCulling(node)) return;
    const renderer = this.elementFactory.getRenderer(node);
    if (renderer) {
      renderer.render(this.canvasKit, canvas, node);
    }
    for (const child of node.children) {
      this.renderNode(canvas, child);
    }
  }

  /**
   * 视口剔除，不在视口范围内的元素不渲染
   */
  shouldViewportCulling(node: SceneNode) {
    if (node.type === "ROOT") return false;
    const viewport = this.interactionController!.getViewportState();
    const renderBox = node.getRenderBox();
    // 都转换成世界坐标进行测试
    return !hitMatrixNodeTest(
      {
        matrix: [1, 0, 0, 1, viewport.x, viewport.y],
        width: viewport?.width,
        height: viewport?.height,
      },
      {
        matrix: [1, 0, 0, 1, renderBox.x, renderBox.y],
        width: renderBox.width,
        height: renderBox.height,
      }
    );
  }

  /**
   * 标记需要重新渲染
   */
  markNeedsRender(): void {
    this.needsRender = true;
  }

  /**
   * 手动触发重新渲染
   */
  forceRender(): void {
    this.markNeedsRender();
  }

  /**
   * 获取交互控制器
   */
  getInteractionController(): InteractionController | undefined {
    return this.interactionController;
  }

  /**
   * 调整画布尺寸
   */
  resize(): void {
    if (!this.canvasKit) return;
    if (this.surface) {
      this.surface.delete();
    }
    const canvasKit = this.canvasKit;
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const container = document.getElementById(
      "canvas-contianer"
    ) as HTMLDivElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const surface = canvasKit.MakeWebGLCanvasSurface(
      canvas,
      canvasKit.ColorSpace.SRGB,
      {
        antialias: 1,
      }
    );
    if (!surface) {
      console.error("无法创建surface");
      return;
    }
    const skCanvas = surface.getCanvas();
    skCanvas.scale(pixelRatio, pixelRatio);
    this.surface = surface;

    this.markNeedsRender();
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.interactionController) {
      this.interactionController.destroy();
    }
    window.removeEventListener("resize", this.debounceResize);
  }
}

export const CanvasRenderer = new Renderer();

export const markRenderDirty = () => {
  CanvasRenderer.markNeedsRender();
};
