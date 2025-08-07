import EyeIcon from '@/assets/eye.svg?react'
import { getProjectState } from '@/store/project'
import { floatRgbaToHex } from '@/utils/color';

export const FillPaintPannel = () => {
    const page = getProjectState('page');
    return <div className="flex items-center">
        <div className="flex-1 flex items-center bg-gray-100 rounded h-7 text-xs">
            <div className="w-4 h-4 bg-[#F3F4F4] border border-gray-300 rounded-sm mx-[5px]"></div>
            <div className='w-[105px]'>
                <input name="fillpaint-pannel" autoComplete="off" spellCheck={false} dir="auto" className='w-[67px] border-0 focus:outline-none' value={floatRgbaToHex(...page.fillPaint.color)} />
            </div>
            <div className="border-l border-gray-200 h-4"></div>
            <span className="w-10 text-right text-color">100</span>
            <span className="text-color mx-1">%</span>
        </div>
        <div className='w-[24px] flex-shrink-0 flex items-center justify-center ml-1'>
            <EyeIcon />
        </div>
    </div>
}