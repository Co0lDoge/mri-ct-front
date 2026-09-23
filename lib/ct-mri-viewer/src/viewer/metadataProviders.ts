import { Enums, cache, metaData } from "@cornerstonejs/core";
import type { CtViewerConfig } from "../types";
import { getWindowRangeFromConfig } from "./windowLevel";

/** Если DICOM metadata нет — подставляем минимально достаточные поля из кэша изображения. */
export function registerCacheBasedMetadataProvider(config: CtViewerConfig): () => void {
  const defaultRange = getWindowRangeFromConfig(config);
  const defaultWC = (defaultRange[0] + defaultRange[1]) / 2;
  const defaultWW = defaultRange[1] - defaultRange[0];
  const modality = config.modality === "MR" ? "MR" : "CT";

  const provider = (type: string, query: unknown) => {
    const imageId = typeof query === "string" ? query : "";
    if (!imageId) return undefined;
    const image = cache.getImage(imageId);
    if (!image) return undefined;

    // Check if real DICOM metadata exists
    const existingMetadata = metaData.get(type, imageId);
    if (existingMetadata) return undefined; // Don't override real DICOM data

    const pixelData = image.getPixelData();
    const ctor = pixelData?.constructor?.name ?? "";
    const bitsAllocated = ctor.includes("16") ? 16 : ctor.includes("8") ? 8 : 16;
    const pixelRepresentation = ctor.includes("Int") ? 1 : 0;
    const bitsStored = bitsAllocated;
    const highBit = bitsStored - 1;

    if (type === Enums.MetadataModules.IMAGE_PIXEL) {
      return {
        pixelRepresentation,
        bitsAllocated,
        bitsStored,
        highBit,
        photometricInterpretation: "MONOCHROME2",
        samplesPerPixel: 1,
      };
    }
    if (type === Enums.MetadataModules.VOI_LUT) {
      const wc = Array.isArray(image.windowCenter) ? image.windowCenter[0] : (image.windowCenter ?? defaultWC);
      const ww = Array.isArray(image.windowWidth) ? image.windowWidth[0] : (image.windowWidth ?? defaultWW);
      return { windowWidth: ww, windowCenter: wc };
    }
    if (type === Enums.MetadataModules.GENERAL_SERIES) {
      const base = imageId.replace(/\/I\d+$/, "").replace(/\D/g, "").slice(-24) || "0";
      return { modality, seriesInstanceUID: `1.2.3.${base}` };
    }
    if (type === Enums.MetadataModules.IMAGE_PLANE) {
      const cols = image.width ?? 512;
      const rows = image.height ?? 512;
      const imageOrientationPatient: [number, number, number, number, number, number] = [1, 0, 0, 0, 1, 0];
      const pixelSpacing: [number, number] = [1, 1];
      const base = imageId.replace(/\/I\d+$/, "").replace(/\D/g, "").slice(-24) || "0";
      const sliceMatch = imageId.match(/\/I(\d+)$/);
      const sliceIndex = sliceMatch ? parseInt(sliceMatch[1], 10) : 0;
      const imagePositionPatient: [number, number, number] = [0, 0, sliceIndex];
      return {
        frameOfReferenceUID: `1.2.3.${base}`,
        columns: cols,
        rows,
        imageOrientationPatient,
        pixelSpacing,
        imagePositionPatient,
      };
    }
    return undefined;
  };
  metaData.addProvider(provider, -50);
  return () => metaData.removeProvider(provider);
}

/** Плоскости для тома после загрузки: иногда IMAGE_PLANE нужно восстановить по volume. */
export function registerVolumeImagePlaneFallback(volumeId: string): () => void {
  const provider = (type: string, query: unknown) => {
    const imageId = typeof query === "string" ? query : "";
    if (type !== Enums.MetadataModules.IMAGE_PLANE) return undefined;
    const vol = cache.getVolume(volumeId) as
      | {
          imageIds: string[];
          dimensions: number[];
          origin: number[];
          direction: Float32Array | number[];
          spacing: number[];
          metadata?: { FrameOfReferenceUID?: string };
        }
      | undefined;
    if (!vol?.imageIds) return undefined;
    const idx = vol.imageIds.indexOf(imageId);
    if (idx < 0) return undefined;
    const [cols, rows] = vol.dimensions;
    const origin = vol.origin as [number, number, number];
    const dir = vol.direction;
    const spacing = vol.spacing as [number, number, number];
    const sliceDir = [dir[6], dir[7], dir[8]] as [number, number, number];
    const imagePositionPatient: [number, number, number] = [
      origin[0] + sliceDir[0] * idx * spacing[2],
      origin[1] + sliceDir[1] * idx * spacing[2],
      origin[2] + sliceDir[2] * idx * spacing[2],
    ];
    const rowCosines = [dir[0], dir[1], dir[2]] as [number, number, number];
    const columnCosines = [dir[3], dir[4], dir[5]] as [number, number, number];
    return {
      frameOfReferenceUID: vol.metadata?.FrameOfReferenceUID ?? "",
      columns: cols,
      rows,
      imagePositionPatient,
      rowCosines,
      columnCosines,
      imageOrientationPatient: [...rowCosines, ...columnCosines],
      rowPixelSpacing: spacing[1],
      columnPixelSpacing: spacing[0],
      pixelSpacing: [spacing[1], spacing[0]],
    };
  };
  metaData.addProvider(provider, -100);
  return () => metaData.removeProvider(provider);
}
