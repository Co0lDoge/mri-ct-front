export type ChunkedUploadConfig = {
  mode: "chunked";
  startUrl: string;
  chunkUrl: string;
  completeUrl: string;
  chunkSizeMb?: number;
  getStartPayload?: (file: File) => Record<string, unknown>;
};

export type ChunkedUploadCompleteMeta = {
  success?: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  chunksCount?: number;
  uploadId?: string;
  fileId?: string;
  [key: string]: unknown;
};

export type ChunkedUploadOptions = {
  onProgress?: (percent: number) => void;
  fetchImpl?: typeof fetch;
};

export const DEFAULT_CHUNK_SIZE_MB = 20;

export function buildChunkedStartPayload(file: File, chunkSizeMb = DEFAULT_CHUNK_SIZE_MB) {
  const chunkSize = chunkSizeMb * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = `${file.name}-${file.size}-${Date.now()}`;
  return {
    fileName: file.name,
    fileSize: file.size,
    totalChunks,
    chunkSize,
    fileId,
  };
}

export async function uploadFileInChunks(
  file: File,
  config: ChunkedUploadConfig,
  options: ChunkedUploadOptions = {}
): Promise<ChunkedUploadCompleteMeta> {
  const fetchFn = options.fetchImpl ?? fetch;
  const chunkSizeMb = config.chunkSizeMb ?? DEFAULT_CHUNK_SIZE_MB;
  const chunkSize = chunkSizeMb * 1024 * 1024;
  const startPayload =
    config.getStartPayload?.(file) ?? buildChunkedStartPayload(file, chunkSizeMb);
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = String(
    (startPayload as { fileId?: unknown }).fileId ?? `${file.name}-${Date.now()}`
  );

  const startResponse = await fetchFn(config.startUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(startPayload),
  });
  if (!startResponse.ok) {
    throw new Error("Не удалось начать сессию загрузки");
  }

  const startData = (await startResponse.json()) as { uploadId?: string };

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("chunkIndex", String(chunkIndex));
    formData.append("totalChunks", String(totalChunks));
    formData.append("fileId", fileId);
    formData.append("fileName", file.name);
    if (startData.uploadId) {
      formData.append("uploadId", startData.uploadId);
    }

    const chunkResponse = await fetchFn(config.chunkUrl, {
      method: "POST",
      body: formData,
    });
    if (!chunkResponse.ok) {
      throw new Error(`Ошибка загрузки чанка ${chunkIndex + 1}/${totalChunks}`);
    }

    const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    options.onProgress?.(progress);
  }

  const completeResponse = await fetchFn(config.completeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileId,
      fileName: file.name,
      uploadId: startData.uploadId,
    }),
  });
  if (!completeResponse.ok) {
    throw new Error("Не удалось завершить загрузку файла");
  }

  const completeData = (await completeResponse.json()) as ChunkedUploadCompleteMeta;
  return {
    ...completeData,
    uploadId: startData.uploadId,
    fileId,
    fileName: completeData.fileName ?? file.name,
  };
}
