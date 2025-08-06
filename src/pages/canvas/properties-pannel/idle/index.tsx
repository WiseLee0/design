import { useViewportState } from "@/store/viewport"
import DropDownSvg from '@/assets/drop-down.svg?react'
import EyeIcon from '@/assets/eye.svg?react'

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
        <div className="px-4 pb-2 flex items-center">
            <div className="flex-1 flex items-center bg-gray-100 rounded h-7 px-2 text-xs">
                <div className="w-4 h-4 bg-[#F3F4F4] border border-gray-300 rounded-sm"></div>
                <span className="ml-2 flex-1 text-color">F3F4F4</span>
                <div className="border-l border-gray-200 h-4 mx-2"></div>
                <span className="w-10 text-right text-color">100</span>
                <span className="text-color mx-1">%</span>
            </div>
            <EyeIcon className="ml-1" />
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