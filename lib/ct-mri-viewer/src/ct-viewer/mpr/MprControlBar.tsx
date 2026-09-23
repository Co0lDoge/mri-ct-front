"use client";

import { Segmented } from "antd";
import { CtViewerToolbar, type CtToolId } from "../CtViewerToolbar";
import { CtLayoutSelector } from "../CtLayoutSelector";
import type { CtLayoutId } from "../../layout";
import type { MprSlotState } from "../../viewer/types";
import { MPR_PROJECTION_OPTIONS } from "../../viewer/constants";

type Props = {
  activeTool: CtToolId;
  onToolChange: (tool: CtToolId) => void;
  onResetWindowLevel: () => void;
  resetWindowLevelDisabled: boolean;
  layout: CtLayoutId;
  onLayoutChange: (layout: CtLayoutId) => void;
  singleProjection: 0 | 1 | 2;
  onSingleProjectionChange: (v: 0 | 1 | 2) => void;
  slots: MprSlotState[];
};

/**
 * Верхняя панель: инструменты Cornerstone, выбор раскладки, переключатель проекции для одного окна.
 */
export function MprControlBar({
  activeTool,
  onToolChange,
  onResetWindowLevel,
  resetWindowLevelDisabled,
  layout,
  onLayoutChange,
  singleProjection,
  onSingleProjectionChange,
  slots,
}: Props) {
  const hasVolume = slots.some((s) => s.seriesId != null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
      <CtViewerToolbar
        activeTool={activeTool}
        onToolChange={onToolChange}
        onResetWindowLevel={onResetWindowLevel}
        resetWindowLevelDisabled={resetWindowLevelDisabled}
      />
      <CtLayoutSelector layout={layout} onLayoutChange={onLayoutChange} />
      {layout === "1" && hasVolume && (
        <Segmented
          size="small"
          value={String(singleProjection)}
          onChange={(v) => onSingleProjectionChange(Number(v) as 0 | 1 | 2)}
          options={MPR_PROJECTION_OPTIONS.map(({ id, label }) => ({ label, value: String(id) }))}
        />
      )}
    </div>
  );
}
