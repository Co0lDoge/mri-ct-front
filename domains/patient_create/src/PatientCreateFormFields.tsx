"use client";

import { Checkbox, DatePicker, Form, Input } from "antd";
import type { Rule } from "antd/es/form";
import locale from "antd/locale/ru_RU";
import { ConfigProvider } from "antd";

import { POLICY_OMS_MASK_DISPLAY_LENGTH, formatPolicySpaced16 } from "./helpers";
import { policyOms16Rule } from "./policyRules";
import type { PatientCreateVariant } from "./types";

const emailRules: Rule[] = [
  { required: true, message: "Введите email пациента" },
  { type: "email", message: "Некорректный email" },
];

export type PatientCreateFormFieldsProps = {
  variant: PatientCreateVariant;
  /** Общий префикс имён полей, если на странице несколько форм */
  namePrefix?: (string | number)[];
};

export function PatientCreateFormFields({ variant, namePrefix }: PatientCreateFormFieldsProps) {
  const p = (name: string) => (namePrefix?.length ? [...namePrefix, name] : name);

  if (variant === "uzi") {
    return (
      <>
        <Form.Item
          name={p("surname")}
          label="Фамилия"
          rules={[{ required: true, message: "Введите фамилию пациента" }]}
        >
          <Input placeholder="Фамилия" size="large" autoComplete="family-name" />
        </Form.Item>
        <Form.Item
          name={p("name")}
          label="Имя"
          rules={[{ required: true, message: "Введите имя пациента" }]}
        >
          <Input placeholder="Имя" size="large" autoComplete="given-name" />
        </Form.Item>
        <Form.Item
          name={p("patronymic")}
          label="Отчество"
          rules={[{ required: true, message: "Введите отчество пациента" }]}
        >
          <Input placeholder="Отчество" size="large" />
        </Form.Item>
        <Form.Item
          name={p("policy")}
          label="Полис ОМС"
          rules={[{ required: true, message: "Введите полис пациента" }, policyOms16Rule]}
          normalize={(v) => formatPolicySpaced16(String(v ?? ""))}
        >
          <Input
            placeholder="0000 0000 0000 0000"
            size="large"
            maxLength={POLICY_OMS_MASK_DISPLAY_LENGTH}
            inputMode="numeric"
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item name={p("email")} label="Электронная почта" rules={emailRules}>
          <Input placeholder="email@example.com" size="large" type="email" autoComplete="email" />
        </Form.Item>
        <ConfigProvider locale={locale}>
          <Form.Item
            name={p("birthDate")}
            label="Дата рождения пациента"
            rules={[{ required: true, message: "Введите дату рождения пациента" }]}
          >
            <DatePicker style={{ width: "100%" }} size="large" format="DD.MM.YYYY" />
          </Form.Item>
        </ConfigProvider>
        <Form.Item
          name={p("diagnosis")}
          label="Диагноз"
          rules={[{ required: true, message: "Введите диагноз пациента" }]}
        >
          <Input.TextArea placeholder="Диагноз" rows={3} />
        </Form.Item>
        <Form.Item label={null}>
          <Form.Item name={p("active")} valuePropName="checked" noStyle initialValue={false}>
            <Checkbox>Активен</Checkbox>
          </Form.Item>
          <Form.Item
            name={p("malignancy")}
            valuePropName="checked"
            noStyle
            initialValue={false}
            style={{ marginLeft: 16, display: "inline-block" }}
          >
            <Checkbox>Заболевание</Checkbox>
          </Form.Item>
        </Form.Item>
      </>
    );
  }

  return (
    <>
      <Form.Item
        name={p("lastName")}
        label="Фамилия"
        rules={[{ required: true, message: "Введите фамилию пациента" }]}
      >
        <Input placeholder="Фамилия" size="large" />
      </Form.Item>
      <Form.Item
        name={p("firstName")}
        label="Имя"
        rules={[{ required: true, message: "Введите имя пациента" }]}
      >
        <Input placeholder="Имя" size="large" />
      </Form.Item>
      <Form.Item
        name={p("fathersName")}
        label="Отчество"
        rules={[{ required: true, message: "Введите отчество пациента" }]}
      >
        <Input placeholder="Отчество" size="large" />
      </Form.Item>
      <Form.Item
        name={p("personalPolicy")}
        label="Полис ОМС"
        rules={[{ required: true, message: "Введите полис пациента" }, policyOms16Rule]}
        normalize={(v) => formatPolicySpaced16(String(v ?? ""))}
      >
        <Input
          placeholder="0000 0000 0000 0000"
          size="large"
          maxLength={POLICY_OMS_MASK_DISPLAY_LENGTH}
          inputMode="numeric"
          autoComplete="off"
        />
      </Form.Item>
      <Form.Item name={p("email")} label="Электронная почта" rules={emailRules}>
        <Input placeholder="email@example.com" size="large" type="email" />
      </Form.Item>
      <ConfigProvider locale={locale}>
        <Form.Item
          name={p("birthDate")}
          label="Дата рождения пациента"
          rules={[{ required: true, message: "Введите дату рождения пациента" }]}
        >
          <DatePicker style={{ width: "100%" }} size="large" format="DD.MM.YYYY" />
        </Form.Item>
      </ConfigProvider>
      <Form.Item name={p("diagnosis")} label="Диагноз">
        <Input.TextArea placeholder="Диагноз" rows={3} />
      </Form.Item>
      <Form.Item name={p("active")} valuePropName="checked" initialValue={false}>
        <Checkbox>Активен</Checkbox>
      </Form.Item>
    </>
  );
}
