import { Typography } from "antd";

export default function PlaceholderRoute({ title }: { title: string }) {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Раздел в процессе переноса на SPA-маршруты.
      </Typography.Paragraph>
    </div>
  );
}
