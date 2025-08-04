import type { SceneNode } from "@/core/models";
import { getProjectState } from "@/store/project";

// 计算节点描边路径
export const calcNodeStrokePath = (node: SceneNode) => {
    const CK = getProjectState('CK');
    if (node.type === 'RECTANGLE') {
        const path = new CK.Path();
        path.addRect([0, 0, node.width, node.height])
        return path;
    }
    if (node.type === 'CIRCLE') {
        const path = new CK.Path();
        const radius = Math.min(node.width, node.height) / 2
        path.addCircle(node.width / 2, node.height / 2, radius)
        return path;
    }
    return new CK.Path();
}