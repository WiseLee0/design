import type { SceneNode } from '@/core/models/scene/scene-node';
import type { EventHandler } from '../event-handler';
import { BaseState } from './state';

/**
 * 移动状态 - 当用户选中一个元素并拖动时进入此状态。
 */
export class MovingState extends BaseState {
    // 被移动的节点
    private nodeToMove!: SceneNode;
    // 上一次鼠标在世界坐标系中的位置
    private lastWorldX = 0;
    private lastWorldY = 0;

    constructor(context: EventHandler) {
        super(context);
    }

    /**
     * 进入移动状态。
     * @param nodeToMove 要移动的节点。
     * @param initialEvent 触发状态切换的鼠标事件，用于获取初始位置。
     */
    enter(nodeToMove: SceneNode, initialEvent: MouseEvent): void {
        this.nodeToMove = nodeToMove;
        
        // 获取初始的世界坐标
        const initialWorldCoords = this.context.getWorldCoordinates(initialEvent.clientX, initialEvent.clientY);
        this.lastWorldX = initialWorldCoords.x;
        this.lastWorldY = initialWorldCoords.y;

        this.context.canvas.style.cursor = 'move';
    }

    /**
     * 退出移动状态，恢复鼠标样式。
     */
    exit(): void {
        this.context.canvas.style.cursor = 'default';
    }

    /**
     * 处理鼠标移动，计算位移并更新节点位置。
     */
    onMouseMove(event: MouseEvent): void {
        event.preventDefault();

        // 获取当前的世界坐标
        const currentWorldCoords = this.context.getWorldCoordinates(event.clientX, event.clientY);

        // 计算在世界坐标系中的位移增量
        const deltaX = currentWorldCoords.x - this.lastWorldX;
        const deltaY = currentWorldCoords.y - this.lastWorldY;

        // 更新节点位置
        this.nodeToMove.translate(deltaX, deltaY);

        // 保存当前位置，用于下一次计算
        this.lastWorldX = currentWorldCoords.x;
        this.lastWorldY = currentWorldCoords.y;
    }

    /**
     * 处理鼠标松开，切换回空闲状态。
     */
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        this.context.transitionTo(this.context.states.idle);
    }

    /**
     * 处理鼠标离开画布，也切换回空闲状态。
     */
    onMouseLeave(event: MouseEvent): void {
        event.preventDefault();
        this.context.transitionTo(this.context.states.idle);
    }
}