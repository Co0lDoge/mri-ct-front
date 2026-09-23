import * as cornerstoneTools from "@cornerstonejs/tools";
import { VIEWPORT_IDS, toolGroupIdForSeries } from "./constants";

const {
  ToolGroupManager,
  PanTool,
  ZoomTool,
  StackScrollTool,
  CrosshairsTool,
  LengthTool,
  RectangleROITool,
  EllipticalROITool,
  WindowLevelTool,
  Enums: ToolsEnums,
} = cornerstoneTools;

const { MouseBindings } = ToolsEnums;

const VIEWPORT_COLORS: Record<string, string> = {
  [VIEWPORT_IDS.CT_AXIAL]: "rgb(200, 0, 0)",
  [VIEWPORT_IDS.CT_SAGITTAL]: "rgb(200, 200, 0)",
  [VIEWPORT_IDS.CT_CORONAL]: "rgb(0, 200, 0)",
};

/**
 * Одна ToolGroup на серию. Crosshairs по умолчанию выключены — включаются в CtViewer при мульти-окне
 * (инструменту нужно ≥2 viewport’а).
 */
export function getOrCreateVolumeToolGroup(seriesId: string, volId: string) {
  const id = toolGroupIdForSeries(seriesId);
  let tg = ToolGroupManager.getToolGroup(id);
  if (tg) return tg;
  tg = ToolGroupManager.createToolGroup(id)!;
  tg.addTool(PanTool.toolName);
  tg.addTool(ZoomTool.toolName);
  tg.addTool(StackScrollTool.toolName);
  tg.addTool(CrosshairsTool.toolName, {
    getReferenceLineColor: (vpId: string) => VIEWPORT_COLORS[vpId] ?? "rgb(0, 200, 0)",
    getReferenceLineControllable: () => true,
    getReferenceLineDraggableRotatable: () => true,
    getReferenceLineSlabThicknessControlsOn: () => true,
    filterActorUIDsToSetSlabThickness: [],
  });
  tg.addTool(LengthTool.toolName, { volumeId: volId });
  tg.addTool(RectangleROITool.toolName, { volumeId: volId });
  tg.addTool(EllipticalROITool.toolName);
  tg.addTool(WindowLevelTool.toolName);
  tg.setToolActive(WindowLevelTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
  tg.setToolActive(PanTool.toolName, { bindings: [{ mouseButton: MouseBindings.Auxiliary }] });
  tg.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: MouseBindings.Secondary }] });
  tg.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: MouseBindings.Wheel }] });
  tg.setToolDisabled(CrosshairsTool.toolName);
  return tg;
}

export {
  ToolGroupManager,
  CrosshairsTool,
  LengthTool,
  EllipticalROITool,
  RectangleROITool,
  WindowLevelTool,
  MouseBindings,
};
