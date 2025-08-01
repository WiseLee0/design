import type { EventHandler } from '../event-handler';

/**
 * 交互状态接口
 */
export interface IState {
    /**
     * 进入状态时调用
     * @param args 可选的进入参数
     */
    enter(...args: any[]): void;

    /**
     * 退出状态时调用
     */
    exit(): void;

    /**
     * 处理鼠标按下事件
     */
    onMouseDown(event: MouseEvent): void;

    /**
     * 处理鼠标移动事件
     */
    onMouseMove(event: MouseEvent): void;

    /**
     * 处理鼠标松开事件
     */
    onMouseUp(event: MouseEvent): void;

    /**
     * 处理鼠标滚轮事件
     */
    onWheel(event: WheelEvent): void;

    /**
     * 处理键盘按下事件
     */
    onKeyDown(event: KeyboardEvent): void;

    /**
     * 处理鼠标离开画布事件
     */
    onMouseLeave(event: MouseEvent): void;
}

/**
 * 基础状态类，提供默认实现
 */
export abstract class BaseState implements IState {
    constructor(protected context: EventHandler) {}

    enter(...args: any[]): void {}
    exit(): void {}
    onMouseDown(event: MouseEvent): void {}
    onMouseMove(event: MouseEvent): void {}
    onMouseUp(event: MouseEvent): void {}
    onWheel(event: WheelEvent): void {}
    onKeyDown(event: KeyboardEvent): void {}
    onMouseLeave(event: MouseEvent): void {}
}