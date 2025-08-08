import OpenEyeIcon from "@/assets/open-eye.svg?react";
import CloseEyeIcon from "@/assets/close-eye.svg?react";
import type { FillPaint } from "@/core/models";
import { floatRgbaToHex } from "@/utils/color";
import { ColorPicker } from "antd";
import { useEffect, useState } from "react";
import tinycolor from "tinycolor2";

interface FillPaintPannelProps {
  fillPaint: FillPaint;
  visibleIcon?: boolean;
  onChange?: (color: FillPaint["color"]) => void;
  onVisibleChange?: (visible: boolean) => void;
}
export const FillPaintPannel = (props: FillPaintPannelProps) => {
  const { fillPaint, visibleIcon = true, onChange, onVisibleChange } = props;
  const hexValue = floatRgbaToHex(
    fillPaint.color[0],
    fillPaint.color[1],
    fillPaint.color[2],
    1
  );
  // Extract opacity value and convert to percentage string
  const opacityValue = Math.round(fillPaint.color[3] * 100).toString();
  const [color, setColor] = useState(hexValue);
  const [opacity, setOpacity] = useState(opacityValue);
  const [visible, setVisible] = useState(fillPaint.visible);
  // Combined hex8 string for the color picker component
  const hex = tinycolor(color)
    .setAlpha(parseFloat(opacity) / 100)
    .toHex8String();

  /**
   * Handles changes from the color input or color picker.
   * Updates the color and opacity, and calls the parent onChange callback.
   * @param colorVal - The new color value (hex).
   * @param opacityVal - The new opacity value (string percentage).
   */
  const handleColorChange = (colorVal = color, opacityVal = opacity) => {
    const value = tinycolor(colorVal).toHex8String();
    // Handles a specific edge case for tinycolor library where black might be misinterpreted.
    if (value === "#000000ff" && !/^0+$/.test(colorVal)) {
      setColor(hexValue.toUpperCase());
      return;
    }
    const alpha = value.slice(-2);
    // If the color hex string includes alpha, update opacity from it.
    if (alpha != "ff") {
      const newColor = value.slice(1, 7).toUpperCase();
      setColor(newColor);
      const newOpacity = Math.round((parseInt(alpha, 16) / 255) * 100);
      setOpacity(newOpacity.toString());
      const result = tinycolor(newColor)
        .setAlpha(newOpacity / 100)
        .toRgb();
      onChange?.([result.r / 255, result.g / 255, result.b / 255, result.a]);
      return;
    }
    // If no alpha in color hex, use the existing opacity state.
    const newColor = value.slice(1, 7).toUpperCase();
    setColor(newColor);
    const result = tinycolor(newColor)
      .setAlpha(parseFloat(opacityVal) / 100)
      .toRgb();
    onChange?.([result.r / 255, result.g / 255, result.b / 255, result.a]);
    return;
  };

  /**
   * Handles color selection from the Ant Design ColorPicker.
   * @param color The Color object from the picker, using 'any' to avoid import complexities.
   */
  const handleColorPickerChange = (color: any) => {
    const newColorHex = color.toHex().toUpperCase();
    // When the picker includes an alpha channel in its selection
    if (newColorHex.length === 8) {
      const colorPart = newColorHex.slice(0, -2);
      const alphaPart = newColorHex.slice(-2);
      const newOpacity = Math.round((parseInt(alphaPart, 16) / 255) * 100);
      const newOpacityStr = newOpacity.toString();
      setOpacity(newOpacityStr);
      setColor(colorPart);
      handleColorChange(colorPart, newOpacityStr);
      return;
    }
    // When the picker returns a standard 6-digit hex
    setColor(newColorHex);
    handleColorChange(newColorHex);
  };

  /**
   * Validates and applies the opacity value from the input field on blur or Enter.
   */
  const handleOpacityChange = () => {
    // Revert to original opacity if input is not a number.
    if (!/^\d+$/.test(opacity)) {
      setOpacity(opacityValue);
      return;
    }
    // Clamp opacity between 0 and 100.
    if (parseFloat(opacity) > 100) {
      setOpacity("100");
      onChange?.([
        fillPaint.color[0],
        fillPaint.color[1],
        fillPaint.color[2],
        1,
      ]);
      return;
    }
    if (parseFloat(opacity) < 0) {
      setOpacity("0");
      onChange?.([
        fillPaint.color[0],
        fillPaint.color[1],
        fillPaint.color[2],
        0,
      ]);
      return;
    }
    // Apply the change.
    handleColorChange();
  };

  // Update internal state when the parent component's fillPaint prop changes.
  useEffect(() => {
    setColor(hexValue);
    setOpacity(opacityValue);
  }, [hexValue, opacityValue]);

  useEffect(() => {
    setVisible(fillPaint.visible);
  }, [fillPaint.visible]);

  return (
    <div className="flex items-center">
      <div className="h-6 flex-1 flex items-center justify-between bg-[#f5f5f5] border border-[#f5f5f5] rounded-[6px] text-xs not-focus-within:hover:border-[#e6e6e6] focus-within:border-[#0d99ff]">
        <div className="flex items-center">
          <ColorPicker
            value={hex}
            size="small"
            className="mx-[4px]"
            style={{ transform: "scale(0.6)" }}
            onChange={handleColorPickerChange}
          />
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
              onBlur={() => handleColorChange()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement)?.blur?.();
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
            value={opacity}
            onChange={(e) => {
              setOpacity(e.target.value);
            }}
            onBlur={handleOpacityChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement)?.blur?.();
              }
            }}
          />
          <span className="text-color mx-1">%</span>
        </div>
      </div>
      <div
        className="w-[24px] flex-shrink-0 flex items-center justify-center ml-1 rounded-[6px] hover:bg-[#f5f5f5]"
        onClick={() => {
          setVisible(!visible);
          onVisibleChange?.(!visible);
        }}
      >
        {visibleIcon && (
          <>
            {visible && <OpenEyeIcon />}
            {!visible && <CloseEyeIcon />}
          </>
        )}
      </div>
    </div>
  );
};
