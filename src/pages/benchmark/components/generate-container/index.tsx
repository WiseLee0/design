import { InputNumber, Button, Space } from "antd";
import { useState } from "react";

interface BenchmarkGenerateContainerProps {
  title?: string;
  submitText?: string;
  defaultValue?: number;
  onSubmit?: (value: number) => void;
}
export const BenchmarkGenerateContainer = (
  props: BenchmarkGenerateContainerProps
) => {
  const [value, setValue] = useState(props.defaultValue || 50);
  return (
    <div className="px-2">
      <div className="text-sm text-[#2f3131] mb-2">
        {props.title || "随机元素数量"}
      </div>
      <Space>
        <InputNumber
          size="small"
          controls={false}
          min={0}
          value={value}
          style={{ width: "120px" }} 
          onChange={(v) => v && setValue(v)}
        />
        <Button size="small" onClick={() => props.onSubmit?.(value)}>
          {props.submitText || "生成"}
        </Button>
      </Space>
    </div>
  );
};
