import EyeIcon from '@/assets/eye.svg?react'
import type { FillPaint } from '@/core/models';
import { floatRgbaToHex } from '@/utils/color';

interface FillPaintPannelProps {
    fillPaint: FillPaint
    visibleIcon?: boolean
    onChange: (color: FillPaint['color']) => void
}
export const FillPaintPannel = (props: FillPaintPannelProps) => {
    const { fillPaint, visibleIcon = true, onChange } = props
    const hexValue = floatRgbaToHex(...fillPaint.color)
    const opcity = Math.round(fillPaint.color[3] * 100)
    return <div className="flex items-center">
        <div className="flex-1 flex items-center justify-between bg-gray-100 rounded-[6px] h-7 text-xs">
            <div className='flex items-center'>
                <div className="w-4 h-4 bg-[#F3F4F4] border border-gray-300 rounded-sm mx-[5px]"></div>
                <div className='w-[85px]'>
                    <input name="fillpaint-pannel" autoComplete="off" spellCheck={false} dir="auto" className='w-[67px] border-0 focus:outline-none' value={hexValue} />
                </div>
            </div>
            <div className="border-l border-white h-4"></div>
            <div className='w-[54px] flex items-center'>
                <input name="fillpaint-pannel" autoComplete="off" spellCheck={false} dir="auto" className='w-[30px] pl-[7px] border-0 focus:outline-none' value={opcity} />
                <span className="text-color mx-1">%</span>
            </div>
        </div>
        <div className='w-[24px] flex-shrink-0 flex items-center justify-center ml-1'>
            {visibleIcon && <EyeIcon />}
        </div>
    </div>
}