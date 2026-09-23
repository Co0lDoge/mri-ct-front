"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, Descriptions, Space, Typography } from "antd";

import { useGetCytologyInfoQuery } from "@/lib/cytologyApi";

export default function CytologyViewerRoutePage() {
  const params = useParams<{ id: string }>();
  const cytologyId = params.id?.trim() ?? "";
  const { data, isFetching } = useGetCytologyInfoQuery(cytologyId, { skip: !cytologyId });

  if (!cytologyId) {
    return (
      <div style={{ padding: 24 }}>
        <Typography.Text type="danger">Не указан идентификатор цитологии.</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1120, margin: "0 auto", width: "100%" }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Цитология #{cytologyId}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Полный viewer из старого проекта еще не перенесен. Временный маршрут показывает ключевые поля
          и ссылки на связанные разделы.
        </Typography.Paragraph>

        <Card loading={isFetching} style={{ borderRadius: 12 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Статус">{data?.status ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Маркировка">
              {data?.diagnostic_marking ?? "—"}-{data?.diagnostic_number ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Дата">{data?.diagnos_date ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Материал">{data?.material_type ?? "—"}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Space size={16}>
          <Link href="/history">История</Link>
          <Link href="/dialogs">Диалоги</Link>
          <Link href="/export">Экспорт</Link>
          <Link href={`/diagnosis_is_complete/${encodeURIComponent(cytologyId)}`}>Статус завершения</Link>
        </Space>
      </Space>
    </div>
  );
}
