import { MainCanvas } from "@/components/canvas";
import { PropertiesPannel } from "./properties-pannel";
export function CanvasPage() {
  return (
    <div className="flex relative w-screen h-screen" >
      <div id="canvas-contianer" className="flex flex-1 h-screen min-w-0">
        <MainCanvas />
      </div>
      <div className="w-[240px] h-screen bg-white">
        <PropertiesPannel />
      </div>
    </div>
  );
}