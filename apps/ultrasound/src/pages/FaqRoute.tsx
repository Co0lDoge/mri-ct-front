import { Card } from "antd";

import { PageShell } from "@medml/layout";

import { UziStudyFaq } from "@/components/UziStudyFaq";

/**
 * Справка. По макету «FAQ»: заголовок с надзаголовком «ИНСТРУКЦИЯ»,
 * ниже — карточки-аккордеоны на всю ширину контентной колонки.
 */
export default function FaqRoute() {
  return (
    <PageShell
      eyebrow="Инструкция"
      title="Как использовать ассистента?"
      subtitle="Типовые сценарии — от регистрации до загрузки повторных снимков."
    >
      <Card styles={{ body: { padding: 24 } }}>
        <UziStudyFaq />
      </Card>
    </PageShell>
  );
}
