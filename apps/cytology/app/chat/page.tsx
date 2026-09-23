import { Card, Typography } from "antd";

export default function ChatPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1120, margin: "0 auto", width: "100%" }}>
      <Card style={{ borderRadius: 12 }}>
        <Typography.Title level={3}>Чаты</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Список чатов будет подключен отдельным этапом. Маршрут сохранен для parity со старым Cytology.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
