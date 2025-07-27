import { getHotKeyState } from '@/store/hotkey';
import type { ViewportManager } from '../viewport';
import { matchZoomScale } from '@/utils/zoom-scale';

/**
 * 事件处理器
 * 负责处理画布上的鼠标和触摸事件
 */
export class EventHandler {
    private canvas: HTMLCanvasElement;
    private viewportManager: ViewportManager;

    // 拖拽状态
    private isDragging = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    // 事件监听器引用，用于清理
    private eventListeners: Array<{ element: EventTarget; type: string; listener: EventListener }> = [];

    constructor(canvas: HTMLCanvasElement, viewportManager: ViewportManager) {
        this.canvas = canvas;
        this.viewportManager = viewportManager;

        this.setupEvents();
    }

    /**
     * 设置所有事件监听器
     */
    private setupEvents(): void {
        this.setupWheelEvent();
        this.setupMouseEvents();
        this.setupKeyboardEvents();
    }

    /**
     * 设置鼠标滚轮事件（缩放）
     */
    private setupWheelEvent(): void {
        const wheelHandler = (e: WheelEvent) => {
            e.preventDefault();

            // 获取鼠标在画布上的位置
            const rect = this.canvas.getBoundingClientRect();
            const centerX = e.clientX - rect.left;
            const centerY = e.clientY - rect.top;

            // 计算缩放增量 - 参考 Figma 的滚轮缩放
            // deltaY 通常为 100 的倍数，我们将其转换为合理的缩放步数
            const delta = -e.deltaY / 100;

            // 执行缩放
            this.viewportManager.zoomDelta(delta, centerX, centerY);
        };

        this.addEventListener(this.canvas, 'wheel', wheelHandler);
    }

    /**
     * 设置鼠标事件（拖拽平移）
     */
    private setupMouseEvents(): void {
        // 鼠标按下
        const mouseDownHandler = (e: MouseEvent) => {
            // 只处理左键和中键
            if (e.button === 1) {
                this.startDrag(e.clientX, e.clientY);
                e.preventDefault();
            }
        };

        // 鼠标移动
        const mouseMoveHandler = (e: MouseEvent) => {
            if (this.isDragging) {
                this.updateDrag(e.clientX, e.clientY);
                e.preventDefault();
            }
        };

        // 鼠标释放
        const mouseUpHandler = (e: MouseEvent) => {
            if (this.isDragging) {
                this.endDrag();
                e.preventDefault();
            }
        };

        // 鼠标离开画布
        const mouseLeaveHandler = () => {
            if (this.isDragging) {
                this.endDrag();
            }
        };

        this.addEventListener(this.canvas, 'mousedown', mouseDownHandler);
        this.addEventListener(document, 'mousemove', mouseMoveHandler);
        this.addEventListener(document, 'mouseup', mouseUpHandler);
        this.addEventListener(this.canvas, 'mouseleave', mouseLeaveHandler);
    }

    /**
     * 设置键盘事件（快捷键支持）
     */
    private setupKeyboardEvents(): void {
        const keyDownHandler = (e: KeyboardEvent) => {
            // Ctrl/Cmd + 0: 重置视口
            if (getHotKeyState('isMainPressed') && e.key === '0') {
                e.preventDefault();
                this.viewportManager.reset();
            }

            // Ctrl/Cmd + =: 放大
            if (getHotKeyState('isMainPressed') && e.key === '=') {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const { scale } = this.viewportManager.getState();
                this.viewportManager.zoom(matchZoomScale(scale, true), centerX, centerY);
            }

            // Ctrl/Cmd + -: 缩小
            if (getHotKeyState('isMainPressed') && e.key === '-') {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const { scale } = this.viewportManager.getState();
                this.viewportManager.zoom(matchZoomScale(scale, false), centerX, centerY);
            }
        };

        this.addEventListener(document, 'keydown', keyDownHandler);
    }

    /**
     * 开始拖拽
     */
    private startDrag(clientX: number, clientY: number): void {
        this.isDragging = true;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;

        // 改变鼠标样式
        this.canvas.style.cursor = 'grabbing';
    }

    /**
     * 更新拖拽
     */
    private updateDrag(clientX: number, clientY: number): void {
        if (!this.isDragging) return;

        const deltaX = clientX - this.lastMouseX;
        const deltaY = clientY - this.lastMouseY;

        this.viewportManager.pan(deltaX, deltaY);

        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
    }

    /**
     * 结束拖拽
     */
    private endDrag(): void {
        this.isDragging = false;

        // 恢复鼠标样式
        this.canvas.style.cursor = 'default';
    }

    /**
     * 添加事件监听器并记录引用
     */
    private addEventListener(element: EventTarget, type: string, listener: any): void {
        element.addEventListener(type, listener);
        this.eventListeners.push({ element, type, listener });
    }

    /**
     * 获取鼠标在画布上的世界坐标
     */
    getWorldCoordinates(clientX: number, clientY: number): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;

        return this.viewportManager.screenToWorld(screenX, screenY);
    }

    /**
     * 销毁事件处理器，清理所有事件监听器
     */
    destroy(): void {
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];

        // 恢复画布样式
        this.canvas.style.cursor = 'default';
    }
}