import { Checkbox, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { UploadSchemaField } from "./uploadSchemaTypes";

export function UploadSchemaFieldItems({
  fields,
  disabled,
}: {
  fields: UploadSchemaField[];
  disabled?: boolean;
}) {
  return (
    <>
      {fields.map((field) => {
        const requiredRule = field.required
          ? [{ required: true, message: `Поле "${String(field.label)}" обязательно` }]
          : [];
        const rules = [...requiredRule, ...(field.rules ?? [])];
        const commonProps = {
          placeholder: field.placeholder,
          disabled: field.disabled || disabled,
        };

        return (
          <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            tooltip={field.tooltip}
            valuePropName={field.type === "checkbox" ? "checked" : "value"}
            rules={rules as never}
          >
            {field.type === "input" ? <Input {...commonProps} /> : null}
            {field.type === "number" ? <InputNumber {...commonProps} style={{ width: "100%" }} /> : null}
            {field.type === "textarea" ? <Input.TextArea {...commonProps} rows={4} /> : null}
            {field.type === "select" ? (
              <Select {...commonProps} options={field.options} showSearch optionFilterProp="label" />
            ) : null}
            {field.type === "checkbox" ? <Checkbox disabled={field.disabled || disabled} /> : null}
            {field.type === "date" ? <DatePicker style={{ width: "100%" }} disabled={field.disabled || disabled} /> : null}
          </Form.Item>
        );
      })}
    </>
  );
}
