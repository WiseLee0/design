import { createStoreUtils } from '@/utils/create-store';

interface ViewportInterface {
    scale: number
    x: number
    y: number
    width: number
    height: number
}
const _viewport: ViewportInterface = {
    scale: 1,
    x: 0,
    y: 0,
    width: 0,
    height: 0
}

export const {
    useStore: useViewportState,
    setState: setViewportState,
    getState: getViewportState,
} = createStoreUtils<ViewportInterface>(_viewport);