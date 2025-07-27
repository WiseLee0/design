import type { BoundingBox, IHittable, Point } from '@/core/engine/collision';
import type { DesignElement } from './type';
import type { CanvasKit } from 'canvaskit-wasm';
import { decomposeMatrix, getAbsoluteBoundingBoxForMatrix } from '@/utils/matrix';

export class RectangleElement implements IHittable {
    id: string
    x: number
    y: number
    rotation: number
    scaleX: number
    scaleY: number
    width: number
    height: number
    data: DesignElement
    CK: CanvasKit

    constructor(data: DesignElement, CK: CanvasKit) {
        this.data = data
        this.CK = CK
        this.id = data.id
        const transfrom = decomposeMatrix(data.matrix)
        this.x = transfrom.x
        this.y = transfrom.y
        this.scaleX = transfrom.scaleX
        this.scaleY = transfrom.scaleY
        this.rotation = transfrom.rotation
        this.width = data.width
        this.height = data.height
    }

    // --- IHittable 接口实现 ---

    /**
     * 获取对象的AABB包围盒
     * @returns {BoundingBox}
     */
    public getAbsoluteBoundingBox(): BoundingBox {
        const matrix = this.data.matrix;
        return getAbsoluteBoundingBoxForMatrix(this.data, matrix)
    }

    /**
     * 精确检测一个点是否在矩形内部。
     * @param point 要检测的点
     * @returns {boolean}
     */
    public hitTest(point: Point): boolean {
        return (
            point.x >= this.x &&
            point.x <= this.x + this.width &&
            point.y >= this.y &&
            point.y <= this.y + this.height
        );
    }

    /**
     * 检测此矩形是否与另一个矩形区域（包围盒）相交。
     * 这是标准的 AABB (Axis-Aligned Bounding Box) 碰撞检测算法。
     * @param box 要检测的区域
     * @returns {boolean}
     */
    public intersectsWith(box: BoundingBox): boolean {
        // 如果一个矩形在另一个矩形的左侧，则不相交
        if (this.x + this.width < box.x || box.x + box.width < this.x) {
            return false;
        }
        // 如果一个矩形在另一个矩形的上方，则不相交
        if (this.y + this.height < box.y || box.y + box.height < this.y) {
            return false;
        }
        // 否则，它们必然相交
        return true;
    }
}