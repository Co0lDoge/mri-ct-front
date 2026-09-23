import { CheckCircleOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Divider, Result, Space, Typography } from "antd";

import { useGetCytologyInfoQuery } from "@/lib/cytologyApi";
import { cytologyLocalizations } from "@medml/cytology_upload";

import "./DiagnosisIsCompleteView.css";

export type DiagnosisIsCompleteViewProps = {
  cytologyId: string;
  onOpenResult: (id: string) => void;
  onUploadMore?: () => void;
  onPatients?: () => void;
};

function formatStudyDate(value?: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DiagnosisIsCompleteView({
  cytologyId,
  onOpenResult,
  onUploadMore,
  onPatients,
}: DiagnosisIsCompleteViewProps) {
  const { data } = useGetCytologyInfoQuery(cytologyId, { skip: !cytologyId });

  if (!cytologyId) {
    return (
      <div className="diagnosis-complete-page">
        <Card className="diagnosis-complete-card">
          <Result
            status="warning"
            title="Не указан идентификатор исследования"
            subTitle="Вернитесь к списку пациентов или загрузите снимок заново."
            extra={
              onPatients ? (
                <Button type="primary" onClick={onPatients}>
                  К списку пациентов
                </Button>
              ) : null
            }
          />
        </Card>
      </div>
    );
  }

  const studyLabel =
    data?.diagnostic_marking && data.diagnostic_number != null
      ? `${data.diagnostic_marking}-${data.diagnostic_number}`
      : null;
  const materialLabel = data?.material_type
    ? (cytologyLocalizations[data.material_type] ?? data.material_type)
    : null;
  const studyDate = formatStudyDate(data?.diagnos_date);
  const hasDetails = Boolean(studyLabel || materialLabel || studyDate);

  return (
    <div className="diagnosis-complete-page">
      <Card className="diagnosis-complete-card">
        <Space direction="vertical" size={20} className="diagnosis-complete-content">
          <div className="diagnosis-complete-icon" aria-hidden>
            <CheckCircleOutlined />
          </div>

          <div className="diagnosis-complete-text">
            <Typography.Title level={2} className="diagnosis-complete-title">
              Диагностика завершена
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="diagnosis-complete-description">
              Результат исследования готов. Откройте снимок, чтобы просмотреть заключение и
              разметку.
            </Typography.Paragraph>
          </div>

          {hasDetails ? (
            <Descriptions
              className="diagnosis-complete-details"
              column={1}
              size="small"
              bordered
            >
              {studyLabel ? (
                <Descriptions.Item label="Исследование">{studyLabel}</Descriptions.Item>
              ) : null}
              {materialLabel ? (
                <Descriptions.Item label="Локализация">{materialLabel}</Descriptions.Item>
              ) : null}
              {studyDate ? (
                <Descriptions.Item label="Дата">{studyDate}</Descriptions.Item>
              ) : null}
            </Descriptions>
          ) : null}

          <Space direction="vertical" size={12} className="diagnosis-complete-actions">
            <Button type="primary" block size="large" onClick={() => onOpenResult(cytologyId)}>
              Открыть результат
            </Button>

            <Divider style={{ margin: "4px 0" }} />

            <Space size={12} wrap className="diagnosis-complete-secondary">
              {onUploadMore ? (
                <Button icon={<UploadOutlined />} onClick={onUploadMore}>
                  Загрузить ещё
                </Button>
              ) : null}
              {onPatients ? (
                <Button type="link" icon={<UserOutlined />} onClick={onPatients}>
                  К списку пациентов
                </Button>
              ) : null}
            </Space>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
