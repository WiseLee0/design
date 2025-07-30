import { ViewportManager } from './viewport';
import { EventHandler } from './events/event-handler';

/**
 * 交互控制器
 * 统一管理画布的所有交互功能
 */
export class InteractionController {
    private viewportManager: ViewportManager;
    private eventHandler: EventHandler;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.viewportManager = new ViewportManager(canvas);
        this.eventHandler = new EventHandler(canvas, this.viewportManager);

        this.setupViewportListener();
    }

    /**
     * 获取缩放值
     */
    get scale() {
        return this.viewportManager.getState().scale
    }

    /**
     * 设置视口状态变化监听器
     */
    private setupViewportListener(): void {
        this.viewportManager.addStateChangeListener((state) => {
            // 可以在这里添加额外的逻辑，比如更新UI显示当前缩放比例
            console.log(`视口状态更新: 缩放=${state.scale.toFixed(2)}, 偏移=(${state.offsetX.toFixed(1)}, ${state.offsetY.toFixed(1)})`);
        });
    }

    /**
     * 获取视口管理器
     */
    getViewportManager(): ViewportManager {
        return this.viewportManager;
    }

    /**
     * 获取事件处理器
     */
    getEventHandler(): EventHandler {
        return this.eventHandler;
    }

    /**
     * 获取当前视口状态
     */
    getViewportState() {
        return this.viewportManager.getState();
    }

    /**
     * 重置视口
     */
    resetViewport(): void {
        this.viewportManager.reset();
    }

    /**
     * 适应内容大小
     * @param contentBounds 内容边界
     */
    fitToContent(contentBounds: { x: number; y: number; width: number; height: number }): void {
        const rect = this.canvas.getBoundingClientRect();
        this.viewportManager.fitToContent(rect.width, rect.height, contentBounds);
    }

    /**
     * 设置缩放限制
     * @param minScale 最小缩放比例
     * @param maxScale 最大缩放比例
     */
    setScaleLimits(minScale: number, maxScale: number): void {
        this.viewportManager.setScaleLimits(minScale, maxScale);
    }

    /**
     * 获取鼠标位置的世界坐标
     * @param clientX 鼠标客户端X坐标
     * @param clientY 鼠标客户端Y坐标
     */
    getWorldCoordinates(clientX: number, clientY: number): { x: number; y: number } {
        return this.eventHandler.getWorldCoordinates(clientX, clientY);
    }

    /**
     * 添加视口状态变化监听器
     * @param listener 监听器函数
     */
    onViewportChange(listener: (state: any) => void): void {
        this.viewportManager.addStateChangeListener(listener);
    }

    /**
     * 移除视口状态变化监听器
     * @param listener 监听器函数
     */
    offViewportChange(listener: (state: any) => void): void {
        this.viewportManager.removeStateChangeListener(listener);
    }

    /**
     * 销毁交互控制器
     */
    destroy(): void {
        this.eventHandler.destroy();
    }
}