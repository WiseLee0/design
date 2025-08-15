import type { IHittable, Point, BoundingBox } from '@/core/engine/collision';
import type { DesignElement, FillPaint } from './type';
import { mat3, vec2 } from 'gl-matrix';
import { hitGhostStrategies, hitPointStrategies } from './hit-strategies';
import { deepClone } from '@/utils/deep-clone';
import { NodeCacheManager } from '@/core/engine/renderers/cache/node-cache-manager';
import { calcNodeHoverPath } from '@/utils/path';
import type { Path } from 'canvaskit-wasm';

// 前向声明，避免循环依赖
interface ISceneTree {
    markNodeDirty(node: SceneNode): void;
}

/**
 * 场景节点 — 基础单元
 */
export class SceneNode implements IHittable {
    private _parent: SceneNode | null = null;
    private _children: SceneNode[] = [];

    // 存储 DesignElement 相关属性
    readonly id: string;
    readonly type: DesignElement['type'];
    private _matrix: DesignElement['matrix'];
    private _width: DesignElement['width'];
    private _height: DesignElement['height'];
    private _visible: DesignElement['visible'];
    private _fillPaints: FillPaint[];

    // 原始 DesignElement
    private _element: DesignElement;

    // 统一缓存管理器
    private cacheManager = new NodeCacheManager();

    // 场景树引用
    private sceneTree?: ISceneTree;

    constructor(element: DesignElement) {
        this.id = element.id;
        this.type = element.type
        this._matrix = [...element.matrix];
        this._width = element.width;
        this._height = element.height;
        this._visible = element.visible;
        this._fillPaints = [...element.fillPaints];
        this._element = element;
        // 初始化时标记相关依赖为脏，确保首次计算正确
        this.cacheManager.markDirty('matrix');
        this.cacheManager.markDirty('width');
        this.cacheManager.markDirty('height');
    }

    // ----- matrix -----
    get matrix(): DesignElement['matrix'] {
        return [...this._matrix];
    }
    set matrix(m: DesignElement['matrix']) {
        this._matrix = [...m];
        this.cacheManager.markDirty('matrix');
        this.notifySceneTree();
    }

    // ----- translate -----
    set x(_x: number) {
        this._matrix[4] = _x;
        this.cacheManager.markDirty('matrix');
        this.notifySceneTree();
    }
    set y(_y: number) {
        this._matrix[5] = _y;
        this.cacheManager.markDirty('matrix');
        this.notifySceneTree();
    }
    translate(dx: number, dy: number) {
        this._matrix[4] += dx;
        this._matrix[5] += dy;
        this.cacheManager.markDirty('matrix');
        this.notifySceneTree();
    }
    setPosition(x: number, y: number) {
        this._matrix[4] = x;
        this._matrix[5] = y;
        this.cacheManager.markDirty('matrix');
        this.notifySceneTree();
    }

    // ----- width -----
    get width(): number {
        return this._width;
    }
    set width(w: number) {
        this._width = w;
        this.cacheManager.markDirty('width');
        this.notifySceneTree();
    }

    // ----- height -----
    get height(): number {
        return this._height;
    }
    set height(h: number) {
        this._height = h;
        this.cacheManager.markDirty('height');
        this.notifySceneTree();
    }

    // ----- visible -----
    get visible(): boolean {
        return this._visible;
    }
    set visible(v: boolean) {
        this._visible = v;
        this.notifySceneTree();
    }

    // ----- fillPaints -----
    get fillPaints(): FillPaint[] {
        return [...this._fillPaints];
    }
    set fillPaints(paints: FillPaint[]) {
        this._fillPaints = [...paints];
        this.notifySceneTree();
    }

    // ----- rotation -----
    get rotation(): number {
        return this.cacheManager.get('rotation', () => {
            // 从矩阵中提取旋转角度
            // 2D变换矩阵的形式为：
            // | a c tx |
            // | b d ty |
            // | 0 0 1  |
            // 其中旋转角度可以通过 atan2(b, a) 计算
            const a = this._matrix[0];
            const b = this._matrix[1];

            // 计算旋转角度
            return Math.atan2(b, a) * (180 / Math.PI);
        });
    }

    /** 获取子节点列表 */
    get children(): SceneNode[] {
        return this._children;
    }

    /** 获取父级节点 */
    get parent(): SceneNode | null {
        return this._parent;
    }

    /** 设置新尺寸并标记脏 */
    setSize(w: number, h: number) {
        this._width = w;
        this._height = h;
        this.cacheManager.markDirty('width');
        this.cacheManager.markDirty('height');
        this.notifySceneTree();
    }

    /** 设置场景树引用 */
    setSceneTree(sceneTree: ISceneTree): void {
        this.sceneTree = sceneTree;
        // 递归设置子节点的场景树引用
        for (const child of this._children) {
            child.setSceneTree(sceneTree);
        }
    }

    /** 通知父节点变化（内部使用） */
    private notifyParentChange(): void {
        this.cacheManager.markDirty('parent');
        this.notifySceneTree();
    }

    /** 通知场景树节点变脏 */
    private notifySceneTree(): void {
        if (this.sceneTree) {
            this.sceneTree.markNodeDirty(this);
        }
    }

    /** 标记子节点变化 */
    private markChildrenDirty(): void {
        this.cacheManager.markDirty('children');
        this.notifySceneTree();
        // 向上传播，父节点的包围盒等也可能受影响
        if (this._parent) {
            this._parent.markChildrenDirty();
        }
    }

    /** 转回设计元素 */
    toElement(): DesignElement {
        return deepClone({
            ...this._element,
            matrix: this._matrix,
            width: this._width,
            height: this._height,
            visible: this._visible,
            fillPaints: this._fillPaints,
        });
    }

    appendChild(node: SceneNode) {
        if (node._parent) node._parent.removeChild(node);
        node._parent = this;
        this._children.push(node);

        // 通知子节点父节点已变化
        node.notifyParentChange();

        // 为新子节点设置场景树引用
        if (this.sceneTree) {
            node.setSceneTree(this.sceneTree);
        }

        this.markChildrenDirty();
    }

    removeChild(node: SceneNode) {
        const i = this._children.indexOf(node);
        if (i > -1) {
            node._parent = null;
            // 通知子节点父节点已变化
            node.notifyParentChange();
            this._children.splice(i, 1);
            this.markChildrenDirty();
        }
    }

    removeChildren() {
        for (const c of this._children) c._parent = null;
        this._children = [];
        this.markChildrenDirty();
    }

    /** 本地变换 */
    private getLocalTransform(): mat3 {
        return mat3.fromValues(
            this._matrix[0], this._matrix[1], 0,
            this._matrix[2], this._matrix[3], 0,
            this._matrix[4], this._matrix[5], 1,
        );
    }

    /** 世界变换 */
    private getAbsoluteTransform(): mat3 {
        return this.cacheManager.get('transform', () => {
            const t = this.getLocalTransform();
            if (this._parent) {
                const pt = this._parent.getAbsoluteTransform();
                mat3.multiply(t, pt, t);
            }
            return t;
        });
    }

    getAbsoluteMatrix(): number[] {
        // gl-matrix（列主序）：[a, b, 0, c, d, 0, tx, ty, 1]
        const [a, b, _aa, c, d, _bb, e, f, _cc] = this.getAbsoluteTransform();
        // CanvasKit（行主序）：[a, c, tx, b, d, ty, 0, 0, 1]
        return [a, b, c, d, e, f];
    }

    /** 世界包围盒 */
    getAbsoluteBoundingBox(): BoundingBox {
        return this.cacheManager.get('boundingBox', () => {
            const transform = this.getAbsoluteTransform();
            const corners: vec2[] = [
                vec2.fromValues(0, 0),
                vec2.fromValues(this._width, 0),
                vec2.fromValues(this._width, this._height),
                vec2.fromValues(0, this._height),
            ];
            corners.forEach(c => vec2.transformMat3(c, c, transform));
            const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]);
            return {
                x: Math.min(...xs),
                y: Math.min(...ys),
                width: Math.max(...xs) - Math.min(...xs),
                height: Math.max(...ys) - Math.min(...ys),
            };
        });
    }

    /**
     * 描边包围盒
     * 包含描边的包围盒
     */
    getStrokeBox(): BoundingBox {
        return this.cacheManager.get('strokeBox', () => {
            // 目前直接返回基础包围盒，后续可以根据描边宽度扩展
            return this.getAbsoluteBoundingBox();
        });
    }

    /**
     * 渲染包围盒
     * 包含描边、阴影、模糊等影响渲染的包围盒
     */
    getRenderBox(): BoundingBox {
        return this.cacheManager.get('renderBox', () => {
            // 目前基于描边包围盒，后续可以根据阴影、模糊等效果扩展
            return this.getStrokeBox();
        });
    }

    /**
     * 获取悬停路径
     */
    getHoverPath() {
        return this.cacheManager.get('hoverPath', (oldPath: Path) => {
            oldPath?.delete?.();
            return calcNodeHoverPath(this)
        });
    }

    /**
     * 点碰撞检测
     */
    hitTest(pt: Point): boolean {
        if (!this._visible) return false;
        const inv = mat3.create();
        mat3.invert(inv, this.getAbsoluteTransform());
        const local = vec2.fromValues(pt.x, pt.y);
        vec2.transformMat3(local, local, inv);
        const fn = hitPointStrategies[this.type];
        return fn ? fn(local, this) : false;
    }

    /**
     * 框选碰撞检测
     */
    intersectsWith(box: BoundingBox): boolean {
        if (!this._visible) return false;
        const fn = hitGhostStrategies[this.type];
        return fn ? fn(box, this) : false;
    }
}