import { useViewportState } from "@/store/viewport";
import DropDownSvg from "@/assets/drop-down.svg?react";
export const ZoomMenuContainer = () => {
  const scale = useViewportState("scale");
  return (
    <div className="w-[66px] h-[28px] flex justify-center items-center text-color text-[11px] box-border rounded-[6px] pl-[4px] hover:bg-[#F5F5F5]">
      <div className="flex-1 flex justify-center items-center">
        <div>{Math.floor(scale * 100)}%</div>
      </div>
      <DropDownSvg />
    </div>
  );
};
