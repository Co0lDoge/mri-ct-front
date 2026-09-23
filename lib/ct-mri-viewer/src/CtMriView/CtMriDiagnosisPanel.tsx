"use client";

import { Button, Card, Flex, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

import type { CtMriDiagnosisPanelProps } from "./types";

const { Text, Title } = Typography;

export function CtMriDiagnosisPanel({
  studyInfo,
  series,
  modality,
  activeSeriesId,
}: CtMriDiagnosisPanelProps) {
  return (
    <Flex vertical gap={12} className="ct-mri-diagnosis">
      <Flex vertical gap={8}>
        <Text type="secondary" strong>
          Заключение
        </Text>
        <Text>{studyInfo.conclusion ?? "Заключение не сформировано."}</Text>
      </Flex>

      <Flex vertical gap={8}>
        <Text type="secondary" strong>
          Серии ({modality})
        </Text>
        <Flex vertical gap={8}>
          {series.map((item) => {
            const active = activeSeriesId === item.id;
            return (
              <Card
                key={item.id}
                size="small"
                style={{
                  borderRadius: 8,
                  border: active ? "1px solid #1677ff" : "1px solid rgba(0,0,0,0.06)",
                  background: active ? "rgba(22, 119, 255, 0.04)" : "#fff",
                }}
              >
                <Flex vertical gap={2}>
                  <Title level={5} style={{ margin: 0 }}>
                    Серия {item.id}
                  </Title>
                  <Text type="secondary">
                    Срезы: {item.sliceCount} · с {item.sliceStart}
                  </Text>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      </Flex>

      <Button type="primary" icon={<EditOutlined />} block>
        Редактировать заключение
      </Button>
    </Flex>
  );
}
