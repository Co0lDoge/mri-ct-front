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
