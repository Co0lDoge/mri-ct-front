"use client";

import * as React from "react";
import dayjs from "dayjs";

import { PatientCreateModal, type PatientCreateModalProps } from "./PatientCreateModal";
import type { PatientCreateValuesUzi } from "./types";

/** Данные пациента, из которых собирается предзаполнение формы. */
export type PatientEditSource = {
  fullName: string;
  email?: string;
  policyNumber?: string;
  /** Дата рождения: `DD.MM.YYYY` (как в UI) либо `YYYY-MM-DD` (как в API). */
  birthDate?: string;
  diagnosis?: string;
  active: boolean;
  malignancy?: boolean;
};

/**
 * Приводит данные карточки пациента к значениям формы.
 *
 * ФИО на бэкенде хранится тремя полями, но в карточку приходит одной
 * строкой, поэтому здесь оно разбирается обратно.
 */
export function toPatientEditValues(patient: PatientEditSource) {
  const [surname = "", name = "", patronymic = ""] = patient.fullName.trim().split(/\s+/);

  return {
    surname,
    name,
    patronymic,
    email: patient.email ?? "",
    policy: patient.policyNumber ?? "",
    birthDate: patient.birthDate
      ? dayjs(patient.birthDate, ["DD.MM.YYYY", "YYYY-MM-DD"])
      : undefined,
    diagnosis: patient.diagnosis ?? "",
    active: patient.active,
    malignancy: Boolean(patient.malignancy),
  };
}

export type PatientEditModalProps = Omit<
  PatientCreateModalProps,
  "title" | "okText" | "initialValues"
> & {
  /** Данные пациента для предзаполнения. */
  patient?: PatientEditSource | null;
  title?: string;
  okText?: string;
};

/**
 * Редактирование карты пациента.
 *
 * Тонкая обёртка над `PatientCreateModal`: поля те же, отличаются только
 * заголовок, подпись кнопки и предзаполнение. Отдельный компонент нужен,
 * чтобы приложения не собирали `initialValues` каждый раз заново.
 */
export function PatientEditModal({
  patient,
  title = "Редактирование карты пациента",
  okText = "Сохранить",
  ...rest
}: PatientEditModalProps) {
  const initialValues = React.useMemo(
    () => (patient ? toPatientEditValues(patient) : undefined),
    [patient]
  );

  return (
    <PatientCreateModal
      {...rest}
      title={title}
      okText={okText}
      initialValues={initialValues}
    />
  );
}

export type { PatientCreateValuesUzi };
