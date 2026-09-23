import * as React from "react";
import { Button, Flex, Form, Progress, Space, Typography, message } from "antd";
import type { FormInstance } from "antd/es/form";
import { uploadFileInChunks, type ChunkedUploadConfig } from "@medml/shared";

import type { UploadSchemaField } from "../ConfigurableUploadForm/uploadSchemaTypes";
import { UploadSchemaFieldItems } from "../ConfigurableUploadForm/UploadSchemaFieldItems";

export type ConfigurableSplitUploadProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  fields: UploadSchemaField[];
  uploadSlot: React.ReactNode;
  /**
   * Контент под полями левой колонки (например, «Добавить нового пациента»).
   * Прижимается к низу колонки, чтобы встать на один уровень с кнопкой
   * отправки в правой колонке — как в макете экрана загрузки.
   */
  formFooterSlot?: React.ReactNode;
  /**
   * Где показывать кнопки отправки/отмены:
   * - `footer` (по умолчанию) — общей строкой под обеими колонками;
   * - `upload-column` — внизу правой колонки, под зоной загрузки.
   */
  actionsPlacement?: "footer" | "upload-column";
  /**
   * Дополнительная кнопка рядом с основной (в макете — «Добавить файл»).
   * Основная кнопка занимает свободное место, дополнительная — по контенту.
   */
  extraActions?: React.ReactNode;
  form?: FormInstance<Record<string, unknown>>;
  initialValues?: Record<string, unknown>;
  submitText?: React.ReactNode;
  cancelText?: React.ReactNode;
  className?: string;
  file?: File | null;
  requireFile?: boolean;
  /** Чанковая загрузка перед onSubmit (как OLD CYTO). */
  chunked?: ChunkedUploadConfig;
  /** Текст второй фазы после сборки чанков (отправка на API). */
  postUploadStatusLabel?: React.ReactNode;
  onCancel?: () => void;
  onSubmit: (payload: {
    values: Record<string, unknown>;
    uploadedFileMeta?: unknown;
  }) => void | Promise<void>;
};

export function ConfigurableSplitUpload({
  title,
  description,
  fields,
  uploadSlot,
  formFooterSlot,
  actionsPlacement = "footer",
  extraActions,
  form: formProp,
  initialValues,
  submitText = "Начать",
  cancelText = "Отменить",
  className,
  file,
  requireFile = true,
  chunked,
  postUploadStatusLabel = "Отправка на сервер диагностики…",
  onCancel,
  onSubmit,
}: ConfigurableSplitUploadProps) {
  const [innerForm] = Form.useForm<Record<string, unknown>>();
  const form = formProp ?? innerForm;
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [submitPhase, setSubmitPhase] = React.useState<"chunks" | "api" | null>(null);

  const handleFinish = async (values: Record<string, unknown>) => {
    if (requireFile && !file) {
      message.error("Выберите файл для загрузки");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setSubmitPhase(chunked?.mode === "chunked" ? "chunks" : "api");
    try {
      let uploadedFileMeta: unknown;
      if (file && chunked?.mode === "chunked") {
        uploadedFileMeta = await uploadFileInChunks(file, chunked, {
          onProgress: setUploadProgress,
        });
        setSubmitPhase("api");
      }

      await onSubmit({ values, uploadedFileMeta });
    } finally {
      setSubmitting(false);
      setSubmitPhase(null);
      setUploadProgress(0);
    }
  };

  const inUploadColumn = actionsPlacement === "upload-column";

  // Полоса загрузки: сначала сборка чанков, затем отправка на API.
  const progress =
    submitting && submitPhase === "chunks" && uploadProgress > 0 ? (
      <div>
        <Progress percent={uploadProgress} status="active" />
        <Typography.Text type="secondary">Загрузка файла: {uploadProgress}%</Typography.Text>
      </div>
    ) : submitting && submitPhase === "api" ? (
      <div>
        <Progress percent={100} status="active" showInfo={false} />
        <Typography.Text type="secondary">{postUploadStatusLabel}</Typography.Text>
      </div>
    ) : null;

  const submitButton = (
    <Button
      type="primary"
      htmlType="submit"
      loading={submitting}
      block={inUploadColumn}
    >
      {submitting && submitPhase === "chunks"
        ? `Загрузка… ${uploadProgress}%`
        : submitting && submitPhase === "api"
          ? postUploadStatusLabel
          : submitText}
    </Button>
  );

  const actions = (
    <Flex
      gap={12}
      align="center"
      justify={inUploadColumn ? "flex-start" : "flex-end"}
      wrap="wrap"
      style={{ width: "100%" }}
    >
      {onCancel ? (
        <Button onClick={onCancel} disabled={submitting}>
          {cancelText}
        </Button>
      ) : null}

      {/* Основная кнопка растягивается, дополнительная — по контенту. */}
      <div style={inUploadColumn ? { flex: 1, minWidth: 200 } : undefined}>
        {submitButton}
      </div>

      {extraActions}
    </Flex>
  );

  return (
    <div className={className}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {title ? (
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
        ) : null}
        {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}

        <Form<Record<string, unknown>>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleFinish}
        >
          {/*
            Колонки тянутся на всю высоту (`align="stretch"`), а внутри —
            flex-колонка с `margin-top: auto` у футера. Так нижние кнопки
            обеих колонок оказываются на одном уровне независимо от того,
            сколько полей в форме.
          */}
          <Flex gap={24} align="stretch" wrap="wrap">
            <div
              style={{
                flex: "1 1 280px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <UploadSchemaFieldItems fields={fields} disabled={submitting} />
              {formFooterSlot ? (
                <div style={{ marginTop: "auto", paddingTop: 8 }}>{formFooterSlot}</div>
              ) : null}
            </div>

            <div
              style={{
                flex: "1 1 280px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {uploadSlot}

              {inUploadColumn ? (
                // `margin-top: auto` прижимает блок к низу колонки, поэтому
                // прогресс и кнопки едут вместе и не наезжают на список файлов.
                <div style={{ marginTop: "auto", display: "grid", gap: 12 }}>
                  {progress}
                  {actions}
                </div>
              ) : null}
            </div>
          </Flex>

          {!inUploadColumn ? (
            <>
              {progress ? <div style={{ marginTop: 16 }}>{progress}</div> : null}
              <div style={{ marginTop: 16 }}>{actions}</div>
            </>
          ) : null}
        </Form>
      </Space>
    </div>
  );
}
