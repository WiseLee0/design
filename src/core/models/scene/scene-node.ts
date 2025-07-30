import type { IHittable, Point, BoundingBox } from '@/core/engine/collision';
import type { DesignElement, FillPaint } from './type';
import { mat3, vec2 } from 'gl-matrix';
import { hitGhostStrategies, hitPointStrategies } from './hit-strategies';
import { deepClone } from '@/utils/deep-clone';

// 前向声明，避免循环依赖
interface ISceneTree {
    markNodeDirty(node: SceneNode): void;
}

/**
 * 场景节点 — 基础单元
 */
export class SceneNode implements IHittable {
    private parent: SceneNode | null = null;
    private children: SceneNode[] = [];

    // 存储 DesignElement 相关属性
    readonly id: string;
    readonly type: DesignElement['type'];
    private _matrix: DesignElement['matrix'];
    private _width: DesignElement['width'];
    private _height: DesignElement['height'];
    private _visible: DesignElement['visible'];
    private _opacity: DesignElement['opacity'];
    private _fillPaints: FillPaint[];

    // 原始 DesignElement
    private _element: DesignElement;

    // 缓存与脏标记
    private _dirty: boolean = false;
    private _dirtyTransform: boolean = false;
    private _dirtyChildren: boolean = false;
    private cacheTransform: mat3 = mat3.create();
    private cacheBBox: BoundingBox | null = null;
    private _cachedRotation: number | null = null;

    // 场景树引用
    private sceneTree?: ISceneTree;

    constructor(element: DesignElement) {
        this.id = element.id;
        this.type = element.type
        this._matrix = [...element.matrix];
        this._width = element.width;
        this._height = element.height;
        this._visible = element.visible;
        this._opacity = element.opacity;
        this._fillPaints = [...element.fillPaints];
        this._element = element;
        // 初始化时标记为脏，确保首次计算正确
        this.markTransformDirty(false);
    }

    // ----- matrix -----
    get matrix(): DesignElement['matrix'] {
        return [...this._matrix];
    }
    set matrix(m: DesignElement['matrix']) {
        this._matrix = [...m];
        this._cachedRotation = null;
        this.markTransformDirty();
    }

    // ----- width -----
    get width(): number {
        return this._width;
    }
    set width(w: number) {
        this._width = w;
        this.markDirty();
    }

    // ----- height -----
    get height(): number {
        return this._height;
    }
    set height(h: number) {
        this._height = h;
        this.markDirty();
    }

    // ----- visible -----
    get visible(): boolean {
        return this._visible;
    }
    set visible(v: boolean) {
        this._visible = v;
        this.markDirty();
    }

    // ----- opacity -----
    get opacity(): number {
        return this._opacity;
    }
    set opacity(o: number) {
        this._opacity = o;
        this.markDirty();
    }

    // ----- fillPaints -----
    get fillPaints(): FillPaint[] {
        return [...this._fillPaints];
    }
    set fillPaints(paints: FillPaint[]) {
        this._fillPaints = [...paints];
        this.markDirty();
    }

    // ----- rotation -----
    get rotation(): number {
        // 如果缓存值存在且矩阵没有变化，直接返回缓存值
        if (this._cachedRotation !== null && !this._dirtyTransform) {
            return this._cachedRotation;
        }

        // 从矩阵中提取旋转角度
        // 2D变换矩阵的形式为：
        // | a c tx |
        // | b d ty |
        // | 0 0 1  |
        // 其中旋转角度可以通过 atan2(b, a) 计算
        const a = this._matrix[0];
        const b = this._matrix[1];

        // 计算旋转角度
        this._cachedRotation = Math.atan2(b, a) * (180 / Math.PI);

        return this._cachedRotation;
    }

    /** 设置新尺寸并标记脏 */
    setSize(w: number, h: number) {
        this._width = w;
        this._height = h;
        this.markDirty();
    }

    /** 设置场景树引用 */
    setSceneTree(sceneTree: ISceneTree): void {
        this.sceneTree = sceneTree;
        // 递归设置子节点的场景树引用
        for (const child of this.children) {
            child.setSceneTree(sceneTree);
        }
    }

    /** 通知场景树节点变脏 */
    private notifySceneTree(): void {
        if (this.sceneTree) {
            this.sceneTree.markNodeDirty(this);
        }
    }

    /** 标记节点为脏状态 */
    markDirty(propagate: boolean = true): void {
        this._dirty = true;
        this.notifySceneTree();
        if (propagate && this.parent) {
            this.parent.markDirtyChildren();
        }
    }

    /** 标记变换为脏状态 */
    markTransformDirty(propagate: boolean = true): void {
        this._dirtyTransform = true;
        this._cachedRotation = null;
        this.markDirty(propagate);
    }

    /** 标记子节点为脏状态 */
    markDirtyChildren(): void {
        this._dirtyChildren = true;
        this.markDirty();
    }

    /** 转回设计元素 */
    toElement(): DesignElement {
        return deepClone({
            ...this._element,
            matrix: this._matrix,
            width: this._width,
            height: this._height,
            visible: this._visible,
            opacity: this._opacity,
            fillPaints: this._fillPaints,
        });
    }

    appendChild(node: SceneNode) {
        if (node.parent) node.parent.removeChild(node);
        node.parent = this;
        this.children.push(node);

        // 为新子节点设置场景树引用
        if (this.sceneTree) {
            node.setSceneTree(this.sceneTree);
        }

        this.markDirty();
    }

    removeChild(node: SceneNode) {
        const i = this.children.indexOf(node);
        if (i > -1) {
            node.parent = null;
            this.children.splice(i, 1);
            this.markDirty();
        }
    }

    removeChildren() {
        for (const c of this.children) c.parent = null;
        this.children = [];
        this.markDirty();
    }

    /** 获取子节点列表 */
    public getChildren(): SceneNode[] {
        return this.children;
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
        if (!this._dirty && !this._dirtyTransform) {
            return mat3.clone(this.cacheTransform);
        }
        let t = this.getLocalTransform();
        if (this.parent) {
            const pt = this.parent.getAbsoluteTransform();
            mat3.multiply(t, pt, t);
        }
        this.cacheTransform = mat3.clone(t);
        this._dirty = false;
        this._dirtyTransform = false;
        return t;
    }

    getAbsoluteMatrix(): number[] {
        // gl-matrix（列主序）：[a, b, 0, c, d, 0, tx, ty, 1]
        const [a, b, _aa, c, d, _bb, e, f, _cc] = this.getAbsoluteTransform();
        // CanvasKit（行主序）：[a, c, tx, b, d, ty, 0, 0, 1]
        return [a, b, c, d, e, f];
    }

    /** 世界包围盒 */
    getAbsoluteBoundingBox(): BoundingBox {
        if (this.cacheBBox && !this._dirtyChildren && !this._dirty && !this._dirtyTransform) {
            return this.cacheBBox;
        }
        const transform = this.getAbsoluteTransform();
        const corners: vec2[] = [
            vec2.fromValues(0, 0),
            vec2.fromValues(this._width, 0),
            vec2.fromValues(this._width, this._height),
            vec2.fromValues(0, this._height),
        ];
        corners.forEach(c => vec2.transformMat3(c, c, transform));
        const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]);
        const bbox = {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
        };
        this.cacheBBox = bbox;
        this._dirtyChildren = false;
        return bbox;
    }

    /**
     * 描边包围盒
     * 包含描边的包围盒
     */
    getStrokeBox(): BoundingBox {
        return this.getAbsoluteBoundingBox()
    }

    /**
     * 渲染包围盒
     * 包含描边、阴影、模糊等影响渲染的包围盒
     */
    getRenderBox(): BoundingBox {
        return this.getAbsoluteBoundingBox()
    }

    hitTest(pt: Point): boolean {
        if (!this._visible) return false;
        const inv = mat3.create();
        mat3.invert(inv, this.getAbsoluteTransform());
        const local = vec2.fromValues(pt.x, pt.y);
        vec2.transformMat3(local, local, inv);
        const fn = hitPointStrategies[this.type];
        return fn ? fn(local, this) : false;
    }

    intersectsWith(box: BoundingBox): boolean {
        if (!this._visible) return false;
        const fn = hitGhostStrategies[this.type];
        return fn ? fn(box, this) : false;
    }
}