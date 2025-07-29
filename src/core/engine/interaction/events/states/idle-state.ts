import { getHotKeyState } from '@/store/hotkey';
import { matchZoomScale } from '@/utils/zoom-scale';
import type { EventHandler } from '../event-handler';
import { BaseState } from './state';

/**
 * 空闲状态 - 默认状态，处理非特定操作（如平移、选择）之外的通用交互。
 */
export class IdleState extends BaseState {
    constructor(context: EventHandler) {
        super(context);
    }

    /**
     * 处理鼠标按下事件。
     * - 左键按下: 切换到框选状态。
     * - 中键按下: 切换到平移状态。
     */
    onMouseDown(event: MouseEvent): void {
        if (event.button === 0) { // 0 是鼠标左键
            event.preventDefault();
            this.context.transitionTo(this.context.states.selecting, event);
        } else if (event.button === 1) { // 1 是鼠标中键
            event.preventDefault();
            this.context.transitionTo(this.context.states.panning, event);
        }
    }

    /**
     * 处理鼠标滚轮事件。
     * - Ctrl/Cmd + 滚轮: 缩放视口。
     * - 直接滚轮: 平移视口。
     */
    onWheel(event: WheelEvent): void {
        event.preventDefault();
        if (getHotKeyState('isMainPressed')) {
            const { canvas, viewportManager } = this.context;
            const rect = canvas.getBoundingClientRect();
            const centerX = event.clientX - rect.left;
            const centerY = event.clientY - rect.top;
            const delta = -event.deltaY / 100;
            viewportManager.zoomDelta(delta, centerX, centerY);
        } else {
            // mac缩放处理
            if (event.metaKey || event.ctrlKey) {
                const { canvas, viewportManager } = this.context;
                const rect = canvas.getBoundingClientRect();
                const centerX = event.clientX - rect.left;
                const centerY = event.clientY - rect.top;
                const delta = -event.deltaY / 5;
                viewportManager.zoomDelta(delta, centerX, centerY);
                return;
            }
            const deltaX = -event.deltaX;
            const deltaY = -event.deltaY;
            this.context.viewportManager.pan(deltaX, deltaY);
        }
    }

    /**
     * 处理键盘按下事件，用于快捷键。
     * - Ctrl/Cmd + 0: 重置视口。
     * - Ctrl/Cmd + =: 放大。
     * - Ctrl/Cmd + -: 缩小。
     */
    onKeyDown(event: KeyboardEvent): void {
        const { canvas, viewportManager } = this.context;

        if (getHotKeyState('isMainPressed') && event.key === '0') {
            event.preventDefault();
            viewportManager.reset();
        }

        if (getHotKeyState('isMainPressed') && event.key === '=') {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const { scale } = viewportManager.getState();
            viewportManager.zoom(matchZoomScale(scale, true), centerX, centerY);
        }

        if (getHotKeyState('isMainPressed') && event.key === '-') {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const { scale } = viewportManager.getState();
            viewportManager.zoom(matchZoomScale(scale, false), centerX, centerY);
        }
    }
}