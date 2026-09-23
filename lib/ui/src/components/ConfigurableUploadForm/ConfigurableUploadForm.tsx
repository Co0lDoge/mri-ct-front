"use client";

import * as React from "react";
import { Button, Form, Space, Typography, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { uploadFileInChunks, type ChunkedUploadConfig } from "@medml/shared";

import { UploadSchemaFieldItems } from "./UploadSchemaFieldItems";
import type { ConfigurableUploadFormProps } from "./uploadSchemaTypes";

export type {
  UploadSchemaFieldOption,
  UploadSchemaField,
  ChunkedUploadConfig,
  UploadConfig,
  ConfigurableUploadSubmitPayload,
  ConfigurableUploadFormProps,
} from "./uploadSchemaTypes";

const { Dragger } = Upload;

export function ConfigurableUploadForm({
  title = "Upload",
  description,
  fields,
  upload,
  initialValues,
  submitText = "Submit",
  cancelText = "Cancel",
  className,
  onCancel,
  onSubmit,
}: ConfigurableUploadFormProps) {
  const [form] = Form.useForm<Record<string, unknown>>();
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const uploadEnabled = upload?.enabled ?? true;
  const maxCount = upload?.maxCount ?? 1;
  const maxSizeBytes = (upload?.maxSizeMb ?? 10240) * 1024 * 1024;

  const fileList: UploadFile[] = file
    ? [
        {
          uid: "upload-file",
          name: file.name,
          size: file.size,
          type: file.type,
          status: "done",
        },
      ]
    : [];

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: upload?.accept,
    maxCount,
    beforeUpload: (nextFile) => {
      if (nextFile.size > maxSizeBytes) {
        message.error(`Файл должен быть меньше ${upload?.maxSizeMb ?? 10240} МБ`);
        return Upload.LIST_IGNORE;
      }
      setFile(nextFile as File);
      return false;
    },
    onRemove: () => {
      setFile(null);
      setUploadProgress(0);
    },
    showUploadList: true,
    fileList,
  };

  const handleFinish = async (values: Record<string, unknown>) => {
    if (uploadEnabled && !file) {
      message.error("Выберите файл перед отправкой");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      let uploadedFileMeta: unknown;
      if (file && upload?.chunked?.mode === "chunked") {
        uploadedFileMeta = await uploadFileInChunks(file, upload.chunked, {
          onProgress: setUploadProgress,
        });
      }

      await onSubmit({
        values,
        file,
        uploadedFileMeta,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {title ? <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title> : null}
        {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}

        <Form<Record<string, unknown>>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleFinish}
        >
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {uploadEnabled ? (
              <Dragger {...uploadProps} disabled={uploading}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  {upload?.draggerDescription ?? "Нажмите или перетащите файл в эту область"}
                </p>
                <p className="ant-upload-hint">{upload?.draggerHint ?? "Поддерживается загрузка одного файла"}</p>
              </Dragger>
            ) : null}

            {uploading && upload?.chunked?.mode === "chunked" && uploadProgress > 0 ? (
              <Typography.Text type="secondary">Загрузка файла: {uploadProgress}%</Typography.Text>
            ) : null}

            <UploadSchemaFieldItems fields={fields} disabled={uploading} />

            <Space style={{ justifyContent: "flex-end", width: "100%" }}>
              {onCancel ? (
                <Button onClick={onCancel} disabled={uploading}>
                  {cancelText}
                </Button>
              ) : null}
              <Button type="primary" htmlType="submit" loading={uploading}>
                {uploading && upload?.chunked?.mode === "chunked"
                  ? `Загрузка… ${uploadProgress}%`
                  : submitText}
              </Button>
            </Space>
          </Space>
        </Form>
      </Space>
    </div>
  );
}
