import type { Rule } from "antd/es/form";

import { POLICY_OMS_DIGIT_COUNT, stripPolicyDigits } from "./helpers";

/** Валидация: в полисе ОМС должно быть ровно 16 цифр. */
export const policyOms16Rule: Rule = {
  validator: (_, value) => {
    const d = stripPolicyDigits(String(value ?? ""));
    if (d.length !== POLICY_OMS_DIGIT_COUNT) {
      return Promise.reject(
        new Error(`Номер полиса ОМС — ${POLICY_OMS_DIGIT_COUNT} цифр`)
      );
    }
    return Promise.resolve();
  },
};
