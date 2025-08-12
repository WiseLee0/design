import { MainCanvas } from "@/components/canvas";
import { ZoomMenuContainer } from "@/components/zoom-menu";
import { BenchmarkGenerateContainer } from "./components/generate-container";
import { benchmarkGenerateElements, benchmarkGenerateRndElements } from "./generate/element";

export const BenchmarkPage = () => {

  return (
    <div className="flex relative w-screen h-screen">
      <div id="canvas-contianer" className="flex flex-1 h-screen min-w-0">
        <MainCanvas />
      </div>
      <div className="w-[240px] h-screen bg-white border-l border-gray-200">
        <div className="flex h-[40px] justify-end items-center px-2">
          <ZoomMenuContainer />
        </div>
        <BenchmarkGenerateContainer title="矩形数量" defaultValue={50000} onSubmit={benchmarkGenerateElements} />
        <div className="border-b border-gray-100 my-4"></div>
        <BenchmarkGenerateContainer defaultValue={5000} onSubmit={benchmarkGenerateRndElements} />
      </div>
    </div>
  );
};
