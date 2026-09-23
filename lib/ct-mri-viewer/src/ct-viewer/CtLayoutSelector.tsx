"use client";

import { useState } from "react";
import { Popover, Tooltip, Button } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import type { CtLayoutId } from "../layout";

const LAYOUTS: { id: CtLayoutId; label: string }[] = [
  { id: "1", label: "1 окно (аксиальная)" },
  { id: "3H", label: "3 окна (в ряд)" },
  { id: "3V", label: "3 окна (в колонку)" },
  { id: "2L1R", label: "2 слева + 1 справа" },
];

type CtLayoutSelectorProps = {
  layout: CtLayoutId;
  onLayoutChange: (layout: CtLayoutId) => void;
};

export function CtLayoutSelector({ layout, onLayoutChange }: CtLayoutSelectorProps) {
  const [open, setOpen] = useState(false);
  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8, minWidth: 220 }}>
      {LAYOUTS.map(({ id, label }) => (
        <Tooltip key={id} title={label} placement="left">
          <Button
            type={layout === id ? "primary" : "default"}
            onClick={() => {
              onLayoutChange(id);
              setOpen(false);
            }}
            style={{ textAlign: "left" }}
            block
          >
            {label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      arrow={false}
      styles={{ body: { padding: 0 } }}
    >
      <Button
        type={open ? "primary" : "default"}
        shape="circle"
        icon={<AppstoreOutlined />}
        aria-label="Выбор раскладки окон"
      />
    </Popover>
  );
}
