import {
  createReadStream,
  createWriteStream,
  existsSync,
  rmSync,
} from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { URL } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import FormDataNode from "form-data";

export type CytologyUploadServerOptions = {
  uploadRoot?: string;
  apiProxyTarget?: string;
  /** Путь создания цитологии на бэкенде, напр. `/api/v3/cytology/create/` (OLD CYTO). */
  cytologyCreatePath?: string;
  /** Таймаут прокси multipart на API (мс). 0 — без лимита. */
  upstreamRequestTimeoutMs?: number;
};

function formatUpstreamError(error: unknown, target: URL): string {
  if (!(error instanceof Error)) {
    return "Ошибка при отправке файла на API";
  }
  const code = "code" in error ? String((error as NodeJS.ErrnoException).code) : "";
  if (code === "ECONNRESET" || code === "EPIPE") {
    return (
      `Сервер ${target.host} разорвал соединение при загрузке файла. ` +
      "Частые причины: лимит размера тела запроса, таймаут прокси или нестабильная сеть."
    );
  }
  if (code === "ETIMEDOUT" || code === "ECONNABORTED") {
    return `Таймаут при отправке файла на ${target.host}`;
  }
  if (code === "HPE_INVALID_CONSTANT") {
    return (
      `Некорректный HTTP-ответ от ${target.host} при загрузке файла. ` +
      "Повторите отправку; если ошибка сохраняется — проверьте URL API и лимиты на сервере."
    );
  }
  return error.message || "Ошибка при отправке файла на API";
}

function normalizeUpstreamErrorPayload(
  statusCode: number,
  parsed: unknown,
  responseBody: string,
  hasAuthorization: boolean
): Record<string, unknown> {
  if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
    return { ...(parsed as Record<string, unknown>), status: statusCode };
  }
  if (typeof parsed === "string" && parsed.length > 0) {
    return { message: parsed };
  }
  if (statusCode === 401) {
    return { message: "Требуется авторизация. Войдите в систему и повторите отправку." };
  }
  if (statusCode === 403) {
    return { message: "Недостаточно прав для загрузки снимка." };
  }
  if (statusCode === 422 && responseBody.length === 0) {
    if (!hasAuthorization) {
      return { message: "Требуется авторизация. Войдите в систему и повторите отправку." };
    }
    return {
      message: "Ошибка валидации данных на сервере (пустой ответ API).",
      status: statusCode,
    };
  }
  if (statusCode === 400) {
    return { message: "Неверный запрос. Проверьте заполнение формы и файл." };
  }
  return { message: `Ошибка API (${statusCode})` };
}

function resolveCytologyCreateUrl(
  apiProxyTarget: string,
  cytologyCreatePath?: string
): URL {
  const path = cytologyCreatePath ?? "/api/v3/cytology/create/";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return new URL(path);
  }
  const base = apiProxyTarget.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${base}${suffix}`);
}

export function resolveUploadRoot(cwd = process.cwd()): string {
  return path.join(cwd, "uploads");
}

export function createUploadSessionId(): string {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function saveUploadChunk(
  uploadRoot: string,
  uploadId: string,
  chunkIndex: string,
  fileBuffer: Buffer
): Promise<void> {
  const chunksDir = path.join(uploadRoot, "chunks", uploadId);
  if (!existsSync(chunksDir)) {
    await mkdir(chunksDir, { recursive: true });
  }
  await writeFile(path.join(chunksDir, `chunk-${chunkIndex}`), fileBuffer);
}

export async function assembleUploadedFile(
  uploadRoot: string,
  uploadId: string,
  fileName: string
): Promise<{ filePath: string; fileSize: number; chunksCount: number }> {
  const chunksDir = path.join(uploadRoot, "chunks", uploadId);
  const finalDir = path.join(uploadRoot, "final");

  if (!existsSync(finalDir)) {
    await mkdir(finalDir, { recursive: true });
  }
  if (!existsSync(chunksDir)) {
    throw new Error("Чанки не найдены");
  }

  const files = await readdir(chunksDir);
  const chunkFiles = files
    .filter((f) => f.startsWith("chunk-"))
    .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));

  if (chunkFiles.length === 0) {
    throw new Error("Нет чанков для сборки");
  }

  const finalFilePath = path.join(finalDir, fileName);
  const writeStream = createWriteStream(finalFilePath);

  for (const chunkFile of chunkFiles) {
    const chunkPath = path.join(chunksDir, chunkFile);
    await new Promise<void>((resolve, reject) => {
      const readStream = createReadStream(chunkPath);
      readStream.on("error", reject);
      readStream.on("end", () => resolve());
      readStream.pipe(writeStream, { end: false });
    });
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end(() => resolve());
    writeStream.on("error", reject);
  });

  const fileStats = await stat(finalFilePath);

  try {
    rmSync(chunksDir, { recursive: true, force: true });
  } catch {
    // ignore
  }

  return {
    filePath: finalFilePath,
    fileSize: fileStats.size,
    chunksCount: chunkFiles.length,
  };
}

const CYTOLOGY_FIELD_KEYS = [
  "diagnostic_marking",
  "diagnostic_number",
  "material_type",
  "calcitonin",
  "thyroglobulin",
  "calcitonin_in_flush",
  "patient_card",
] as const;

export async function proxyStagedCytologyCreate(
  uploadRoot: string,
  apiProxyTarget: string,
  body: Record<string, string>,
  authorization?: string,
  cytologyCreatePath?: string,
  upstreamRequestTimeoutMs?: number
): Promise<{ statusCode: number; data: unknown }> {
  const fileName = body.fileName;
  if (!fileName) {
    return { statusCode: 400, data: { success: false, message: "fileName обязателен" } };
  }

  const finalPath = path.join(uploadRoot, "final", fileName);
  if (!existsSync(finalPath)) {
    return { statusCode: 404, data: { success: false, message: "Собранный файл не найден" } };
  }

  const fileStats = await stat(finalPath);
  console.info(
    `[cytology-upload] proxy staged create: ${fileName} (${fileStats.size} bytes) -> ${resolveCytologyCreateUrl(apiProxyTarget, cytologyCreatePath).href}`
  );
  const formData = new FormDataNode();
  formData.append("image", createReadStream(finalPath), {
    filename: fileName,
    contentType: "application/octet-stream",
    knownLength: fileStats.size,
  });

  for (const key of CYTOLOGY_FIELD_KEYS) {
    if (body[key] != null) {
      formData.append(key, body[key]);
    }
  }

  const apiUrl = resolveCytologyCreateUrl(apiProxyTarget, cytologyCreatePath);
  const extraHeaders: Record<string, string> = {};
  if (authorization) {
    extraHeaders.Authorization = authorization;
  }

  const { statusCode, responseBody } = await submitMultipart(
    apiUrl,
    formData,
    extraHeaders,
    upstreamRequestTimeoutMs ?? 0
  );

  let data: unknown = null;
  if (responseBody.length > 0) {
    try {
      data = JSON.parse(responseBody);
    } catch {
      data = responseBody;
    }
  }

  if (statusCode < 200 || statusCode >= 300) {
    return {
      statusCode,
      data: normalizeUpstreamErrorPayload(
        statusCode,
        data,
        responseBody,
        Boolean(authorization)
      ),
    };
  }

  return { statusCode, data };
}

function submitMultipart(
  target: URL,
  formData: FormDataNode,
  extraHeaders: Record<string, string>,
  timeoutMs = 0
): Promise<{ statusCode: number; responseBody: string }> {
  const isHttps = target.protocol === "https:";
  const port = target.port ? Number(target.port) : isHttps ? 443 : 80;

  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        reject(
          Object.assign(new Error(`Таймаут при отправке на ${target.host}`), { code: "ETIMEDOUT" })
        );
      }, timeoutMs);
    }

    formData.submit(
      {
        protocol: isHttps ? "https:" : "http:",
        host: target.hostname,
        port,
        path: `${target.pathname}${target.search}`,
        method: "POST",
        headers: {
          ...formData.getHeaders(),
          ...extraHeaders,
        },
      },
      (error, response) => {
        if (timer != null) {
          clearTimeout(timer);
        }
        if (error) {
          reject(Object.assign(error, { message: formatUpstreamError(error, target) }));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk as Buffer));
        response.on("error", (err) => {
          reject(Object.assign(err, { message: formatUpstreamError(err, target) }));
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode ?? 500,
            responseBody: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
  });
}

export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk as Buffer));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw.length > 0 ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export async function parseNodeMultipart(req: IncomingMessage): Promise<{
  fields: Record<string, string>;
  fileBuffer: Buffer | null;
}> {
  const formidable = (await import("formidable")).default;

  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (Array.isArray(value)) {
          normalized[key] = value[0] ?? "";
        } else if (typeof value === "string") {
          normalized[key] = value;
        }
      }

      const uploaded = files.file?.[0];
      let fileBuffer: Buffer | null = null;
      if (uploaded?.filepath) {
        fileBuffer = await readFile(uploaded.filepath);
      }

      resolve({ fields: normalized, fileBuffer });
    });
  });
}

export async function handleCytologyUploadHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  options: CytologyUploadServerOptions = {}
): Promise<boolean> {
  const uploadRoot = options.uploadRoot ?? resolveUploadRoot();
  const apiProxyTarget = options.apiProxyTarget ?? "http://localhost:8080";

  if (req.method !== "POST") {
    return false;
  }

  if (pathname === "/api/upload/start") {
    sendJson(res, 200, {
      success: true,
      uploadId: createUploadSessionId(),
      message: "Сессия загрузки начата",
    });
    return true;
  }

  if (pathname === "/api/upload/chunk") {
    const { fields, fileBuffer } = await parseNodeMultipart(req);
    if (!fileBuffer || fields.chunkIndex == null || !fields.uploadId) {
      sendJson(res, 400, { success: false, message: "Некорректные данные чанка" });
      return true;
    }

    await saveUploadChunk(uploadRoot, fields.uploadId, fields.chunkIndex, fileBuffer);
    sendJson(res, 200, {
      success: true,
      chunkIndex: Number(fields.chunkIndex),
      uploadedChunks: Number(fields.chunkIndex) + 1,
      totalChunks: Number(fields.totalChunks ?? 0),
    });
    return true;
  }

  if (pathname === "/api/upload/complete") {
    const body = (await readJsonBody(req)) as { fileName?: string; uploadId?: string };
    if (!body.fileName || !body.uploadId) {
      sendJson(res, 400, { success: false, message: "Недостаточно данных для сборки файла" });
      return true;
    }

    try {
      const result = await assembleUploadedFile(uploadRoot, body.uploadId, body.fileName);
      sendJson(res, 200, {
        success: true,
        message: "Файл успешно собран",
        filePath: result.filePath,
        fileName: body.fileName,
        fileSize: result.fileSize,
        chunksCount: result.chunksCount,
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        message: error instanceof Error ? error.message : "Ошибка сборки",
      });
    }
    return true;
  }

  if (pathname === "/api/upload/create-cytology") {
    const body = (await readJsonBody(req)) as Record<string, string>;
    const authHeader = req.headers.authorization;
    const authorization = typeof authHeader === "string" ? authHeader : undefined;
    const { statusCode, data } = await proxyStagedCytologyCreate(
      uploadRoot,
      apiProxyTarget,
      body,
      authorization,
      options.cytologyCreatePath,
      options.upstreamRequestTimeoutMs
    );
    sendJson(res, statusCode, data);
    return true;
  }

  return false;
}
