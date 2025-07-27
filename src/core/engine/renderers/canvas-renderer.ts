import InitCanvasKit, { type CanvasKit, type Surface } from 'canvaskit-wasm';
import type { DesignElement } from '@/core/models';
import { ElementRendererFactory } from './renderer-factory';
import { getProjectState } from '@/store/project';
import { InteractionController } from '../interaction/interaction-controller';

class Renderer {
    private canvasKit!: CanvasKit;
    private surface!: Surface;
    private rendererFactory = new ElementRendererFactory();
    private interactionController?: InteractionController;

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
            this.forceRender();
        });

        // this.fitToContent()

        this.renderLoop();
    }

    private renderLoop() {
        const renderFrame = () => {
            this.render();
            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
    }

    /**
     * 主渲染方法
     * 从 store 获取元素数据并渲染到画布
     */
    render() {
        if (!this.surface) return;

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

        // 获取当前项目状态中的元素
        const elements = getProjectState('mockElements');

        // 渲染所有元素
        this.renderElements(elements);

        // 恢复变换状态
        canvas.restore();

        // 刷新画布
        this.surface.flush();
    }

    /**
     * 渲染元素列表
     */
    private renderElements(elements: DesignElement[]): void {
        elements.forEach(element => {
            this.renderElement(element);
        });
    }

    /**
     * 渲染单个元素
     */
    private renderElement(element: DesignElement): void {
        if (!element.visible) return;

        // 获取对应的渲染器
        const renderer = this.rendererFactory.getRenderer(element);
        if (!renderer) {
            console.warn(`未找到类型为 ${element.type} 的渲染器`);
            return;
        }

        // 使用渲染器渲染元素
        const canvas = this.surface.getCanvas();
        renderer.render(this.canvasKit, canvas, element);
    }

    /**
     * 手动触发重新渲染
     * 当 store 数据变化时可以调用此方法
     */
    forceRender(): void {
        this.render();
    }

    /**
     * 注册新的渲染器
     */
    registerRenderer(renderer: any): void {
        this.rendererFactory.registerRenderer(renderer);
    }

    /**
     * 获取交互控制器
     */
    getInteractionController(): InteractionController | undefined {
        return this.interactionController;
    }

    /**
     * 重置视口
     */
    resetViewport(): void {
        if (this.interactionController) {
            this.interactionController.resetViewport();
        }
    }

    /**
     * 适应内容大小
     */
    fitToContent(): void {
        if (!this.interactionController) return;

        const elements = getProjectState('mockElements');
        if (elements.length === 0) return;

        // 计算所有元素的边界框
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        elements.forEach(element => {
            if (!element.visible) return;

            // 获取元素的变换矩阵
            const [a, b, c, d, e, f] = element.matrix;

            // 计算元素的四个角点
            const corners = [
                { x: 0, y: 0 },
                { x: element.width, y: 0 },
                { x: element.width, y: element.height },
                { x: 0, y: element.height }
            ];

            // 应用变换矩阵到每个角点
            corners.forEach(corner => {
                const x = a * corner.x + c * corner.y + e;
                const y = b * corner.x + d * corner.y + f;

                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            });
        });

        // 如果有有效的边界框，则适应内容
        if (minX !== Infinity && minY !== Infinity && maxX !== -Infinity && maxY !== -Infinity) {
            const contentBounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };

            this.interactionController.fitToContent(contentBounds);
        }
    }

    /**
     * 获取鼠标位置的世界坐标
     */
    getWorldCoordinates(clientX: number, clientY: number): { x: number; y: number } | null {
        if (!this.interactionController) return null;
        return this.interactionController.getWorldCoordinates(clientX, clientY);
    }

    /**
     * 设置缩放限制
     */
    setScaleLimits(minScale: number, maxScale: number): void {
        if (this.interactionController) {
            this.interactionController.setScaleLimits(minScale, maxScale);
        }
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
