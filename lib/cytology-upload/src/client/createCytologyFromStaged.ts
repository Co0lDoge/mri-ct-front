import type { ChunkedUploadCompleteMeta } from "./types";

import { CYTOLOGY_STAGED_CREATE_URL } from "./chunkUploadConfig";

export type CytologyStagedCreateFields = {
  fileName: string;
  diagnostic_marking: string;
  diagnostic_number: string;
  material_type: string;
  calcitonin: string;
  thyroglobulin: string;
  calcitonin_in_flush: string;
  patient_card: string;
};

export type CytologyStagedCreateResponse = {
  id?: string | number;
  image_id?: string | number;
  pk?: string;
  [key: string]: unknown;
};

export function mapStagedMetaToFileName(staged: ChunkedUploadCompleteMeta): string {
  const fileName = staged.fileName ?? "";
  if (!fileName) {
    throw new Error("Не получено имя собранного файла после чанковой загрузки");
  }
  return fileName;
}

export async function createCytologyFromStagedRequest(
  body: CytologyStagedCreateFields,
  accessToken?: string
): Promise<CytologyStagedCreateResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(CYTOLOGY_STAGED_CREATE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown = null;
  if (text.length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const err = new Error("createCytologyFromStaged failed");
    (err as Error & { status?: number; data?: unknown }).status = response.status;
    (err as Error & { data?: unknown }).data = data;
    throw err;
  }

  return data as CytologyStagedCreateResponse;
}
