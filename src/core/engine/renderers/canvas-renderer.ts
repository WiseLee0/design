import InitCanvasKit, { type Canvas, type CanvasKit, type Surface } from 'canvaskit-wasm';
import { ElementRendererFactory } from './elements/renderer-factory';
import { getProjectState } from '@/store/project';
import { InteractionController } from '../interaction/interaction-controller';
import { SelectionRendererFactory } from './selection/renderer-factory';
import { SceneTree } from '@/core/models/scene/scene-tree';
import { SceneNode } from '@/core/models/scene/scene-node';

class Renderer {
    private canvasKit!: CanvasKit;
    private surface!: Surface;
    private elementFactory = new ElementRendererFactory();
    private interactionController?: InteractionController;
    private selectionFactory = new SelectionRendererFactory();
    private sceneTree!: SceneTree;

    // 脏标记驱动渲染
    private needsRender: boolean = false;
    private isRendering: boolean = false;

    async init() {
        const canvasKit = await InitCanvasKit({
            locateFile: (file) => `/node_modules/canvaskit-wasm/bin/${file}`,
        });
        this.canvasKit = canvasKit;

        const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = innerWidth * pixelRatio;
        canvas.height = innerHeight * pixelRatio;
        canvas.style.width = `${innerWidth}px`;
        canvas.style.height = `${innerHeight}px`;

        const surface = canvasKit.MakeWebGLCanvasSurface(canvas, canvasKit.ColorSpace.SRGB, {});
        if (!surface) {
            console.error('无法创建surface');
            return;
        }
        const skCanvas = surface.getCanvas();
        skCanvas.scale(pixelRatio, pixelRatio);
        this.surface = surface;

        // 初始化交互控制器
        this.interactionController = new InteractionController(canvas);

        // 监听视口变化，触发重新渲染
        this.interactionController.onViewportChange(() => {
            this.markNeedsRender();
        });

        // 初始构建场景树
        const elements = getProjectState('mockElements');
        this.sceneTree = new SceneTree();

        // 设置场景树变化回调
        this.sceneTree.onSceneChange(() => {
            this.markNeedsRender();
        });

        this.sceneTree.build(elements);

        // 初始标记需要渲染
        this.markNeedsRender();
        this.renderLoop();
    }

    private renderLoop() {
        const renderFrame = () => {
            if (this.needsRender && !this.isRendering) {
                console.log('render');
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
        canvas.clear(this.canvasKit.TRANSPARENT);

        // 保存当前变换状态
        canvas.save();

        // 应用视口变换
        if (this.interactionController) {
            const viewportState = this.interactionController.getViewportState();
            const transform = viewportState.transformMatrix;
            canvas.concat([
                transform[0], transform[1], transform[4],
                transform[2], transform[3], transform[5],
                0, 0, 1
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
        this.selectionFactory.execture(this.canvasKit, this.surface.getCanvas())
    }

    /**
     * 递归渲染单个节点及其子节点
     */
    private renderNode(canvas: Canvas, node: SceneNode): void {
        if (!node.visible) return;
        const renderer = this.elementFactory.getRenderer(node);
        if (renderer) {
            renderer.render(this.canvasKit, canvas, node);
        }
        for (const child of node.getChildren()) {
            this.renderNode(canvas, child);
        }
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
     * 销毁渲染器
     */
    destroy(): void {
        if (this.interactionController) {
            this.interactionController.destroy();
        }
    }
}

export const CanvasRenderer = new Renderer();

export const markRenderDirty = () => {
    CanvasRenderer.markNeedsRender();
}