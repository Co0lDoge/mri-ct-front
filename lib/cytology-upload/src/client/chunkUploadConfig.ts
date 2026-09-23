import type { ChunkedUploadConfig } from "./types";

/** Чанковая загрузка .svs для всех приложений цитологии. */
export const cytologyChunkUploadConfig: ChunkedUploadConfig = {
  mode: "chunked",
  startUrl: "/api/upload/start",
  chunkUrl: "/api/upload/chunk",
  completeUrl: "/api/upload/complete",
  chunkSizeMb: 20,
};

export const CYTOLOGY_STAGED_CREATE_URL = "/api/upload/create-cytology";

export const CYTOLOGY_UPLOAD_MAX_SIZE_GB = 10;
