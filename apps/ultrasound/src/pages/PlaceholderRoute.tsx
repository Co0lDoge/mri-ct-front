import { Typography } from "antd";

import { PageShell } from "@medml/layout";

const { Paragraph } = Typography;

/**
 * Заглушка для разделов в разработке.
 * Ширину и отступы задаёт общий каркас, а не собственный контейнер.
 */
export default function PlaceholderRoute({ title }: { title: string }) {
  return (
    <PageShell title={title}>
      <Paragraph type="secondary">Раздел в разработке.</Paragraph>
    </PageShell>
  );
}
