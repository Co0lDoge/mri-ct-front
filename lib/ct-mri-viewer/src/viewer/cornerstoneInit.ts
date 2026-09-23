import { Enums, init as coreInit } from "@cornerstonejs/core";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import * as cornerstoneTools from "@cornerstonejs/tools";
import * as polySeg from "@cornerstonejs/polymorphic-segmentation";

let cornerstoneInitialized = false;

/**
 * Инициализирует Cornerstone один раз глобально.
 * Предотвращает повторную инициализацию при повторном монтировании компонентов.
 */
export async function initializeCornerstone(): Promise<void> {
  if (cornerstoneInitialized) {
    return;
  }

  try {
    await coreInit({
      rendering: { renderingEngineMode: Enums.RenderingEngineModeEnum.ContextPool },
      debug: { statsOverlay: false },
    });

    dicomImageLoaderInit({ maxWebWorkers: navigator.hardwareConcurrency ?? 1 });

    cornerstoneTools.init({ addons: { polySeg } });
    cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);
    cornerstoneTools.addTool(cornerstoneTools.WindowLevelTool);
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.CrosshairsTool);
    cornerstoneTools.addTool(cornerstoneTools.LengthTool);
    cornerstoneTools.addTool(cornerstoneTools.RectangleROITool);
    cornerstoneTools.addTool(cornerstoneTools.EllipticalROITool);

    cornerstoneInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Cornerstone:", error);
    throw error;
  }
}

/**
 * Проверяет, инициализирован ли Cornerstone.
 */
export function isCornerstoneInitialized(): boolean {
  return cornerstoneInitialized;
}