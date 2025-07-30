interface MatrixElement {
    matrix: [number, number, number, number, number, number] | number[]; // [a, b, c, d, e, f]
    width: number;
    height: number;
}

export function hitMatrixNodeTest(element1: MatrixElement, element2: MatrixElement): boolean {
    // 检查是否是简单平移+缩放（无旋转）
    if (isAxisAligned(element1) && isAxisAligned(element2)) {
        return axisAlignedIntersection(element1, element2);
    }
    // 使用分离轴定理(SAT)判断两个凸多边形是否相交

    // 获取第一个元素的四个角点
    const corners1 = getTransformedCorners(element1);
    // 获取第二个元素的四个角点
    const corners2 = getTransformedCorners(element2);

    // 检查两个多边形是否相交
    return polygonsIntersect(corners1, corners2);
}

// 检查矩阵是否无旋转（只有平移和缩放）
function isAxisAligned(element: MatrixElement): boolean {
    return Math.abs(element.matrix[1]) < 1e-6 && Math.abs(element.matrix[2]) < 1e-6;
}

// 轴对齐矩形的快速相交检测
function axisAlignedIntersection(element1: MatrixElement, element2: MatrixElement): boolean {
    const [a1, , , d1, e1, f1] = element1.matrix;
    const [a2, , , d2, e2, f2] = element2.matrix;

    // 计算实际宽高（考虑缩放）
    const w1 = element1.width * a1;
    const h1 = element1.height * d1;
    const w2 = element2.width * a2;
    const h2 = element2.height * d2;

    // 计算两个矩形的边界
    const left1 = e1;
    const right1 = e1 + w1;
    const top1 = f1;
    const bottom1 = f1 + h1;

    const left2 = e2;
    const right2 = e2 + w2;
    const top2 = f2;
    const bottom2 = f2 + h2;

    // 相交条件
    return left1 < right2 &&
        right1 > left2 &&
        top1 < bottom2 &&
        bottom1 > top2;
}


function getTransformedCorners(element: MatrixElement): [number, number][] {
    const { matrix, width, height } = element;
    const [a, b, c, d, e, f] = matrix;

    // 原始四个角点（基于width和height）
    const originalCorners: [number, number][] = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ];

    // 应用矩阵变换到每个角点
    return originalCorners.map(([x, y]) => {
        return [
            a * x + c * y + e,
            b * x + d * y + f
        ];
    }) as [number, number][];
}

function polygonsIntersect(poly1: [number, number][], poly2: [number, number][]): boolean {
    // 分离轴定理实现
    const polygons = [poly1, poly2];

    for (let i = 0; i < polygons.length; i++) {
        const polygon = polygons[i];

        for (let j = 0; j < polygon.length; j++) {
            const p1 = polygon[j];
            const p2 = polygon[(j + 1) % polygon.length];

            // 获取边的法向量
            const normal = { x: p2[1] - p1[1], y: p1[0] - p2[0] };

            // 对两个多边形投影到法向量上
            const proj1 = projectPolygon(poly1, normal);
            const proj2 = projectPolygon(poly2, normal);

            // 检查投影是否重叠
            if (proj1.max < proj2.min || proj2.max < proj1.min) {
                return false; // 发现分离轴，不相交
            }
        }
    }

    return true; // 所有轴上都重叠，说明相交
}

function projectPolygon(polygon: [number, number][], normal: { x: number, y: number }): { min: number, max: number } {
    let min = Infinity;
    let max = -Infinity;

    for (const point of polygon) {
        const projected = normal.x * point[0] + normal.y * point[1];
        min = Math.min(min, projected);
        max = Math.max(max, projected);
    }

    return { min, max };
}