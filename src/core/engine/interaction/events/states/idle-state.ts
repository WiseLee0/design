import { getHotKeyState } from '@/store/hotkey';
import { matchZoomScale } from '@/utils/zoom-scale';
import type { EventHandler } from '../event-handler';
import { BaseState } from './state';
import { CollisionDetector, type Point } from '@/core/engine/collision';
import { getProjectState } from '@/store/project';
import { getSelectionState, setSelectionState } from '@/store/selection';
import { hitMatrixNodeTest } from '@/utils/hit-test';

/**
 * 空闲状态 - 默认状态，处理非特定操作（如平移、选择）之外的通用交互。
 */
export class IdleState extends BaseState {
    constructor(context: EventHandler) {
        super(context);
    }

    /**
     * 处理鼠标按下事件。
     * - 左键按下: 切换到框选 | 移动状态。
     * - 中键按下: 切换到平移状态。
     */
    onMouseDown(event: MouseEvent): void {
        if (event.button === 0) { // 0 是鼠标左键
            event.preventDefault();
            const point = this.context.getWorldCoordinates(event.clientX, event.clientY);
            const isHit = this._downHitTest(point)
            if (isHit) {
                // 移动状态
                this.context.transitionTo(this.context.states.moving, event);
            } else {
                // 框选状态
                this.context.transitionTo(this.context.states.selecting, event);
            }
        } else if (event.button === 1) { // 1 是鼠标中键
            event.preventDefault();
            this.context.transitionTo(this.context.states.panning, event);
        }
    }

    /**
     * 处理悬停事件，元素进行碰撞检测
     */
    onMouseMove(event: MouseEvent): void {
        const point = this.context.getWorldCoordinates(event.clientX, event.clientY);
        this._hoverHitTest(point)
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

    private _downHitTest(point: Point) {
        const selectionBoxs = getSelectionState('selectionBoxs');
        // 先对选中框进行碰撞检测
        for (let i = 0; i < selectionBoxs.length; i++) {
            const selectionBox = selectionBoxs[i]
            const isHit = hitMatrixNodeTest({ matrix: [1, 0, 0, 1, point.x, point.y], width: 1, height: 1 }, selectionBox)
            if (isHit) {
                setSelectionState({
                    moveInfo: {
                        type: 'selection-box',
                        value: i
                    }
                })
                return true
            }
        }
        // 在对元素进行碰撞检测
        const id = this._hoverHitTest(point)
        if (id) {
            setSelectionState({
                moveInfo: {
                    type: 'id',
                    value: id
                }
            })
            return true
        }

        // 什么都没命中
        setSelectionState({
            moveInfo: null
        })
        return false
    }

    private _hoverHitTest(point: Point) {
        const sceneTree = getProjectState('sceneTree')
        const node = CollisionDetector.findHit(point, sceneTree.root.children)
        const ids = getSelectionState('ids');
        // hover元素不能在选择框内
        if (node?.id && ids.size > 1 && ids.has(node.id)) {
            setSelectionState({ hoverId: null })
            return null;
        }
        setSelectionState({
            hoverId: node?.id || null
        })
        return node?.id || null
    }
}