import type { ChunkedUploadCompleteMeta } from "@medml/shared";
import {
  type CytologyStagedCreateFields,
  formatCytologyUploadApiError,
} from "@medml/cytology-upload";

export function cytologyFormFieldToString(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  return String(value).trim();
}

export function mapUploadValuesToCytologyStagedBody(
  values: Record<string, unknown>,
  staged: ChunkedUploadCompleteMeta
): CytologyStagedCreateFields {
  const fileName = staged.fileName ?? "";
  if (!fileName) {
    throw new Error("Не получено имя собранного файла после чанковой загрузки");
  }

  return {
    fileName,
    diagnostic_marking: cytologyFormFieldToString(values.marking),
    diagnostic_number: cytologyFormFieldToString(values.number),
    material_type: cytologyFormFieldToString(values.localization),
    calcitonin: cytologyFormFieldToString(values.calcitonin),
    thyroglobulin: cytologyFormFieldToString(values.thyroglobulin),
    calcitonin_in_flush: cytologyFormFieldToString(values.calcInSense),
    patient_card: cytologyFormFieldToString(values.patientCard),
  };
}

export function formatCytologyUploadError(error: unknown): string {
  return formatCytologyUploadApiError(error);
}

export function resolveCytologyCreateId(result: {
  id?: string | number;
  image_id?: string | number;
  pk?: string | number;
}): string | number | undefined {
  return result.id ?? result.image_id ?? result.pk;
}
