import { Card, Typography } from "antd";

export default function SendPatientCardPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1120, margin: "0 auto", width: "100%" }}>
      <Card style={{ borderRadius: 12 }}>
        <Typography.Title level={3}>Отправка карты пациента</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Страница сохранена для parity; бизнес-логика отправки будет подключена отдельным этапом.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
