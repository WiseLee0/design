import { FillPaintPannel } from "@/components/fillpaint-pannel";
import {setPageState, usePageState } from "@/store/page";
import { ZoomMenuContainer } from "@/components/zoom-menu";

export const IdlePannel = () => {
  return (
    <div>
      <div className="flex h-[40px] justify-end items-center px-2">
        <ZoomMenuContainer />
      </div>
      <div className="border-t border-gray-200"></div>
      <div className="flex items-center h-[40px] text-[12px] pl-[16px]">
        页面
      </div>
      <PageColorControl />
    </div>
  );
};

const PageColorControl = () => {
  const pageFillPaint = usePageState("fillPaint");
  return (
    <div className="px-4 pb-2">
      <FillPaintPannel
        fillPaint={pageFillPaint}
        onChange={(color) => {
          setPageState({
            fillPaint: {
              ...pageFillPaint,
              color: color,
              visible: true,
            },
          });
        }}
        onVisibleChange={(visible) => {
          setPageState({
            fillPaint: {
              ...pageFillPaint,
              visible,
            },
          });
        }}
      />
    </div>
  );
};