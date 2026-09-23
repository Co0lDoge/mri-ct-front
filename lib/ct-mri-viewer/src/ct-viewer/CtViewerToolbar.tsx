"use client";

import { Tooltip } from "antd";
import { RiGitCommitLine, RiContrastLine, RiCircleLine, RiRectangleLine, RiRulerLine, RiRefreshLine } from "@remixicon/react";

export type CtToolId = "WindowLevel" | "Crosshairs" | "Length" | "RectangleROI" | "EllipseROI";

const TOOL_CONFIG: { id: CtToolId; label: string; icon: React.ReactNode }[] = [
  { id: "Crosshairs", label: "Линии уровня", icon: <RiGitCommitLine /> },
  { id: "WindowLevel", label: "Яркость", icon: <RiContrastLine /> },
  { id: "Length", label: "Измерение длины", icon: <RiRulerLine /> },
  { id: "RectangleROI", label: "Прямоугольная область", icon: <RiRectangleLine /> },
  { id: "EllipseROI", label: "Эллиптическая область", icon: <RiCircleLine /> },
];

type CtViewerToolbarProps = {
  activeTool: CtToolId;
  onToolChange: (tool: CtToolId) => void;
  onResetWindowLevel?: () => void;
  resetWindowLevelDisabled?: boolean;
};

export function CtViewerToolbar({
  activeTool,
  onToolChange,
  onResetWindowLevel,
  resetWindowLevelDisabled,
}: CtViewerToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 8px",
        background: "#1a1a1a",
        borderRadius: 6,
      }}
    >
      {TOOL_CONFIG.map(({ id, label, icon }) => (
        <Tooltip key={id} title={label} placement="bottom">
          <button
            type="button"
            onClick={() => onToolChange(id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              padding: 0,
              border: "none",
              borderRadius: 6,
              background: activeTool === id ? "rgba(24, 144, 255, 0.3)" : "transparent",
              color: activeTool === id ? "#1890ff" : "rgba(255,255,255,0.75)",
              cursor: "pointer",
              fontSize: 18,
            }}
            onMouseEnter={(e) => {
              if (activeTool !== id) {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTool !== id) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              }
            }}
          >
            {icon}
          </button>
        </Tooltip>
      ))}
      {onResetWindowLevel && (
        <Tooltip title="Сбросить яркость к изначальному" placement="bottom">
          <button
            type="button"
            onClick={onResetWindowLevel}
            disabled={resetWindowLevelDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              padding: 0,
              border: "none",
              borderRadius: 6,
              background: "transparent",
              color: resetWindowLevelDisabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)",
              cursor: resetWindowLevelDisabled ? "not-allowed" : "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
            onMouseEnter={(e) => {
              if (!resetWindowLevelDisabled) {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!resetWindowLevelDisabled) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              }
            }}
          >
            <RiRefreshLine />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
