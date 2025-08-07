import { useViewportState } from "@/store/viewport"
import DropDownSvg from '@/assets/drop-down.svg?react'
import { FillPaintPannel } from "@/components/fillpaint-pannel"

export const IdlePannel = () => {
    return <div>
        <div className="flex h-[40px] justify-end items-center px-2">
            <ZoomMenuContainer />
        </div>
        <div className="border-t border-gray-200"></div>
        <div className="flex items-center h-[40px] text-[12px] pl-[16px]">页面</div>
        <PageColorControl />
    </div>
}

const PageColorControl = () => {
    return (
        <div className="px-4 pb-2">
            <FillPaintPannel />
        </div>
    )
}

const ZoomMenuContainer = () => {
    const scale = useViewportState('scale')
    return <div className="w-[66px] h-[28px] flex justify-center items-center text-color text-[11px] box-border rounded-[6px] pl-[4px] hover:bg-[#F5F5F5]">
        <div className="flex-1 flex justify-center items-center">
            <div>{Math.floor(scale * 100)}%</div>
        </div>
        <DropDownSvg />
    </div>
}