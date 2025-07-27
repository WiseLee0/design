import { CanvasRenderer } from "@/core/engine"
import { useHotKey } from "@/hooks/useHotKey"
import { useEffect } from "react"

export const MainCanvas = () => {
    useHotKey();
    useEffect(() => {
        CanvasRenderer.init()
    }, [])

    return <canvas width={innerWidth} height={innerHeight} id={'main-canvas'} />
}