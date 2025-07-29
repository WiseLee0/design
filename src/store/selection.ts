import type { XYWH } from '@/core/models';
import { createStoreUtils } from '@/utils/create-store';
import { getProjectState } from './project';
import { mergeBoundingBoxes } from '@/utils/bounding-box';

interface SelectionBoxItem {
    matrix: number[];
    width: number;
    height: number;
}
interface SelectionInterface {
    ids: Set<string>
    ghostBox: XYWH
    selectionBoxs: SelectionBoxItem[]
}
const _selection: SelectionInterface = {
    ids: new Set(),
    ghostBox: [0, 0, 0, 0],
    selectionBoxs: []
}

const {
    useStore: useSelectionState,
    setState: _setSelectionState,
    getState: getSelectionState,
} = createStoreUtils<SelectionInterface>(_selection);

const calcSelectionBoxs = (ids: Set<string>): void => {
    if (!ids.size) {
        _setSelectionState({ selectionBoxs: [] })
        return;
    }
    const sceneTree = getProjectState('sceneTree');
    const nodes = sceneTree.findByIds(ids);
    const boxes = nodes.map(node => node.getAbsoluteBoundingBox())
    if (boxes.length > 1) {
        const selectionBox = mergeBoundingBoxes(boxes)
        _setSelectionState({
            selectionBoxs: [{
                width: selectionBox.width,
                height: selectionBox.height,
                matrix: [1, 0, 0, 1, selectionBox.x, selectionBox.y]
            }]
        })
    } else if (boxes.length === 1 && nodes.length === 1) {
        const node = nodes[0]
        _setSelectionState({
            selectionBoxs: [{
                width: node.width,
                height: node.height,
                matrix: node.matrix
            }]
        })
    }
}

const setSelectionState = (data: Partial<SelectionInterface>) => {
    if (data.ids) {
        calcSelectionBoxs(data.ids)
    }
    _setSelectionState(data)
}

export { useSelectionState, setSelectionState, getSelectionState };
