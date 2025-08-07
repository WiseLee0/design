import EyeIcon from "@/assets/eye.svg?react";
import type { FillPaint } from "@/core/models";
import { floatRgbaToHex } from "@/utils/color";
import { useEffect, useState } from "react";
import tinycolor from "tinycolor2";

interface FillPaintPannelProps {
  fillPaint: FillPaint;
  visibleIcon?: boolean;
  onChange?: (color: FillPaint["color"]) => void;
}
export const FillPaintPannel = (props: FillPaintPannelProps) => {
  const { fillPaint, visibleIcon = true, onChange } = props;
  const hexValue = floatRgbaToHex(
    fillPaint.color[0],
    fillPaint.color[1],
    fillPaint.color[2],
    1
  );
  const opcityValue = Math.round(fillPaint.color[3] * 100).toString();
  const [color, setColor] = useState(hexValue);
  const [opcity, setOpcity] = useState(opcityValue);

  const handleColorChange = () => {
    const value = tinycolor(color).toHex8String();
    if (value === "#000000ff" && !/^0+$/.test(color)) {
      setColor(hexValue.toUpperCase());
      return;
    }
    const alpha = value.slice(-2);
    if (alpha != "ff") {
      const newColor = value.slice(1, 7).toUpperCase();
      setColor(newColor);
      const newOpcity = Math.round((parseInt(alpha, 16) / 255) * 10000) / 100;
      setOpcity(newOpcity.toString());
      const result = tinycolor(newColor)
        .setAlpha(newOpcity / 100)
        .toRgb();
      onChange?.([result.r / 255, result.g / 255, result.b / 255, result.a]);
      return;
    }
    const newColor = value.slice(1, 7).toUpperCase();
    setColor(newColor);
    const result = tinycolor(newColor)
      .setAlpha(parseFloat(opcity) / 100)
      .toRgb();
    onChange?.([result.r / 255, result.g / 255, result.b / 255, result.a]);
    return;
  };

  const handleOpcityChange = () => {
    if (!/^\d+$/.test(opcity)) {
      setOpcity(opcityValue);
      return;
    }
    if (parseFloat(opcity) > 100) {
      setOpcity("100");
      onChange?.([
        fillPaint.color[0],
        fillPaint.color[1],
        fillPaint.color[2],
        1,
      ]);
      return;
    }
    if (parseFloat(opcity) < 0) {
      setOpcity("0");
      onChange?.([
        fillPaint.color[0],
        fillPaint.color[1],
        fillPaint.color[2],
        0,
      ]);
      return;
    }
    handleColorChange();
  };

  useEffect(() => {
    setColor(hexValue);
  }, [hexValue]);

  useEffect(() => {
    setOpcity(opcityValue);
  }, [opcityValue]);

  return (
    <div className="flex items-center">
      <div className="flex-1 flex items-center justify-between bg-[#f5f5f5] border border-[#f5f5f5] rounded-[6px] h-7 text-xs not-focus-within:hover:border-[#e6e6e6] focus-within:border-[#0d99ff]">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#F3F4F4] border border-gray-300 rounded-sm mx-[5px]"></div>
          <div className="w-[80px]">
            <input
              name="fillpaint-pannel"
              autoComplete="off"
              spellCheck={false}
              dir="auto"
              className="w-[67px] border-0 focus:outline-none text-[11px]"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
              }}
              onBlur={handleColorChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleColorChange();
                }
              }}
            />
          </div>
        </div>
        <div className="border-l border-white h-4"></div>
        <div className="w-[60px] flex items-center">
          <input
            name="fillpaint-pannel"
            autoComplete="off"
            spellCheck={false}
            dir="auto"
            className="w-[40px] pl-[7px] border-0 focus:outline-none text-[11px]"
            value={opcity}
            onChange={(e) => {
              setOpcity(e.target.value);
            }}
            onBlur={handleOpcityChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleOpcityChange();
              }
            }}
          />
          <span className="text-color mx-1">%</span>
        </div>
      </div>
      <div className="w-[24px] flex-shrink-0 flex items-center justify-center ml-1">
        {visibleIcon && <EyeIcon />}
      </div>
    </div>
  );
};
