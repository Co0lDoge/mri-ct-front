import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  assembleUploadedFile,
  createUploadSessionId,
  proxyStagedCytologyCreate,
  resolveUploadRoot,
  saveUploadChunk,
  type CytologyUploadServerOptions,
} from "../server/handlers";

export type CytologyUploadNextOptions = CytologyUploadServerOptions;

function getOptions(): CytologyUploadNextOptions {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.VITE_API_BASE_URL ??
    "/api/v3";
  const cytologyCreatePath =
    process.env.CYTOLOGY_CREATE_PATH ??
    process.env.VITE_CYTOLOGY_CREATE_PATH ??
    `${apiBaseUrl.replace(/\/$/, "")}/cytology/create/`;

  return {
    uploadRoot: resolveUploadRoot(),
    apiProxyTarget:
      process.env.CYTOLOGY_API_PROXY_TARGET ??
      process.env.VITE_CYTOLOGY_PROXY_TARGET ??
      process.env.API_BASE_URL ??
      "http://localhost:8080",
    cytologyCreatePath,
  };
}

export async function cytologyUploadStartHandler() {
  return NextResponse.json({
    success: true,
    uploadId: createUploadSessionId(),
    message: "Сессия загрузки начата",
  });
}

export async function cytologyUploadChunkHandler(request: NextRequest) {
  const { uploadRoot } = getOptions();
  const formData = await request.formData();
  const file = formData.get("file");
  const chunkIndex = formData.get("chunkIndex");
  const totalChunks = formData.get("totalChunks");
  const uploadId = formData.get("uploadId");

  if (!(file instanceof Blob) || chunkIndex == null || uploadId == null) {
    return NextResponse.json(
      { success: false, message: "Некорректные данные чанка" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await saveUploadChunk(uploadRoot!, String(uploadId), String(chunkIndex), buffer);

  return NextResponse.json({
    success: true,
    chunkIndex: Number(chunkIndex),
    uploadedChunks: Number(chunkIndex) + 1,
    totalChunks: Number(totalChunks ?? 0),
  });
}

export async function cytologyUploadCompleteHandler(request: NextRequest) {
  const { uploadRoot } = getOptions();
  const body = (await request.json()) as { fileName?: string; uploadId?: string };

  if (!body.fileName || !body.uploadId) {
    return NextResponse.json(
      { success: false, message: "Недостаточно данных для сборки файла" },
      { status: 400 }
    );
  }

  try {
    const result = await assembleUploadedFile(uploadRoot!, body.uploadId, body.fileName);
    return NextResponse.json({
      success: true,
      message: "Файл успешно собран",
      filePath: result.filePath,
      fileName: body.fileName,
      fileSize: result.fileSize,
      chunksCount: result.chunksCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Ошибка сборки",
      },
      { status: 400 }
    );
  }
}

export async function cytologyUploadCreateCytologyHandler(request: NextRequest) {
  const { uploadRoot, apiProxyTarget, cytologyCreatePath, upstreamRequestTimeoutMs } =
    getOptions();
  const body = (await request.json()) as Record<string, string>;
  const authorization = request.headers.get("authorization") ?? undefined;

  const { statusCode, data } = await proxyStagedCytologyCreate(
    uploadRoot!,
    apiProxyTarget!,
    body,
    authorization,
    cytologyCreatePath,
    upstreamRequestTimeoutMs
  );

  return NextResponse.json(data, { status: statusCode });
}
