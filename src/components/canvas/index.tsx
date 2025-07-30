import { CanvasRenderer } from "@/core/engine"
import { SceneTree } from "@/core/models";
import { useHotKey } from "@/hooks/useHotKey"
import { getProjectState, setProjectState } from "@/store/project";
import { useEffect } from "react"

export const MainCanvas = () => {
    useHotKey();
    useEffect(() => {
        const elements = getProjectState('mockElements');
        const sceneTree = new SceneTree();
        sceneTree.build(elements);
        setProjectState({ sceneTree })
        CanvasRenderer.init(sceneTree);
    }, [])

    return <canvas width={innerWidth} height={innerHeight} id={'main-canvas'} />
}