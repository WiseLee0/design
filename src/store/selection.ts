import type { XYWH } from '@/core/models';
import { createStoreUtils } from '@/utils/create-store';

interface SelectionInterface {
    ids: Set<string>
    ghostBox: XYWH
    selectionBoxs: XYWH[]
}
const _selection: SelectionInterface = {
    ids: new Set(),
    ghostBox: [0, 0, 0, 0],
    selectionBoxs: []
}

export const {
    useStore: useSelectionState,
    setState: setSelectionState,
    getState: getSelectionState,
} = createStoreUtils<SelectionInterface>(_selection);