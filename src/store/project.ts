import type { SceneTree, DesignElement, FillPaint, DesignColor } from '@/core/models';
import { createStoreUtils } from '@/utils/create-store';
import type { CanvasKit, Surface } from 'canvaskit-wasm';

// 创建一些模拟数据
const mockElements: DesignElement[] = [
    {
        id: '0',
        type: "RECTANGLE",
        matrix: [1, 0, 0, 1, 10, 10],
        width: 100,
        height: 100,
        visible: true,
        opacity: 1,
        fillPaints: [{
            color: [1, 0, 0, 1],
            visible: true,
            blendMode: "NORMAL"
        }]
    }, {
        id: '1',
        type: "CIRCLE",
        matrix: [1, 0, 0, 1, 150, 50],
        width: 80,
        height: 80,
        visible: true,
        opacity: 1,
        fillPaints: [{
            color: [0, 1, 0, 1],
            visible: true,
            blendMode: "NORMAL"
        }]
    }, {
        id: '2',
        type: "RECTANGLE",
        matrix: [0.6203069686889648, -0.7843591570854187, 0.7843591570854187, 0.6203069686889648, 150, 150],
        width: 80,
        height: 180,
        visible: true,
        opacity: 0.8,
        fillPaints: [{
            color: [1, 0, 1, 1],
            visible: true,
            blendMode: "NORMAL"
        }]
    }
];

interface ProjectState {
    mockElements: DesignElement[]
    page: {
        fillPaint: FillPaint
    }
    sceneTree: SceneTree
    CK: CanvasKit
    surface: Surface
}
const _projectState = {
    mockElements,
    page: {
        fillPaint: {
            color: [0.9529411764705882, 0.9568627450980393, 0.9568627450980393, 1], // #F3F4F4
            visible: true,
            blendMode: "NORMAL"
        } as FillPaint
    },
    sceneTree: null!,
    CK: null!,
    surface: null!,
}

export const {
    useStore: useProjectState,
    setState: setProjectState,
    getState: getProjectState,
} = createStoreUtils<ProjectState>(_projectState);


export const findById = (id: string) => {
    const sceneTree = getProjectState('sceneTree');
    return sceneTree.findById(id)
}

export const findByIds = (ids?: string[] | Set<string>) => {
    const sceneTree = getProjectState('sceneTree');
    return sceneTree.findByIds(ids)
}

export const getRootNode = () => {
    const sceneTree = getProjectState('sceneTree');
    return sceneTree.root
}