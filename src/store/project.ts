import type { DesignElement } from '@/core/models';
import { createStoreUtils } from '@/utils/create-store';

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
    },
    {
        id: '1',
        type: "CIRCLE",
        matrix: [1, 0, 0, 1, 150, 50],
        width: 80,
        height: 80,
        visible: true,
        opacity: 0.8,
        fillPaints: [{
            color: [0, 1, 0, 1],
            visible: true,
            blendMode: "NORMAL"
        }]
    }
];

interface ProjectState {
    mockElements: DesignElement[]
}
const _projectState = {
    mockElements
}

export const {
    useStore: useProjectState,
    setState: setProjectState,
    getState: getProjectState,
} = createStoreUtils<ProjectState>(_projectState);