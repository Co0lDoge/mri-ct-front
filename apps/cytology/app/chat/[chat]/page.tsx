"use client";

import { useParams } from "next/navigation";
import { Card, Typography } from "antd";

export default function ChatThreadPage() {
  const params = useParams<{ chat: string }>();

  return (
    <div style={{ padding: 24, maxWidth: 1120, margin: "0 auto", width: "100%" }}>
      <Card style={{ borderRadius: 12 }}>
        <Typography.Title level={3}>Чат #{params.chat ?? "—"}</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Детальный поток сообщений будет перенесен на следующем этапе. Маршрут создан для совместимости ссылок.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
