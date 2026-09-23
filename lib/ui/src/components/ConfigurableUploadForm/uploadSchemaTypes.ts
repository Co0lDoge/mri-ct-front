import type * as React from "react";

export type UploadSchemaFieldOption = {
  label: React.ReactNode;
  value: string | number;
};

export type UploadSchemaField = {
  name: string;
  label: React.ReactNode;
  type: "input" | "number" | "select" | "textarea" | "checkbox" | "date";
  placeholder?: string;
  required?: boolean;
  rules?: Array<Record<string, unknown>>;
  options?: UploadSchemaFieldOption[];
  disabled?: boolean;
  /** Подсказка у подписи поля — иконка «?» с всплывающим текстом. */
  tooltip?: React.ReactNode;
};

export type { ChunkedUploadConfig } from "@medml/shared";
import type { ChunkedUploadConfig } from "@medml/shared";

export type UploadConfig = {
  enabled?: boolean;
  accept?: string;
  maxCount?: number;
  maxSizeMb?: number;
  draggerHint?: React.ReactNode;
  draggerDescription?: React.ReactNode;
  chunked?: ChunkedUploadConfig;
};

export type ConfigurableUploadSubmitPayload = {
  values: Record<string, unknown>;
  file: File | null;
  uploadedFileMeta?: unknown;
};

export type ConfigurableUploadFormProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  fields: UploadSchemaField[];
  upload?: UploadConfig;
  initialValues?: Record<string, unknown>;
  submitText?: React.ReactNode;
  cancelText?: React.ReactNode;
  className?: string;
  onCancel?: () => void;
  onSubmit: (payload: ConfigurableUploadSubmitPayload) => Promise<void> | void;
};
