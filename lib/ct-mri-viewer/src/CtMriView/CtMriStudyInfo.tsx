"use client";

import { Badge, Flex, Typography } from "antd";
import { DisconnectOutlined } from "@ant-design/icons";

import type { CtMriStudyInfo } from "./types";

const { Text, Title } = Typography;

type CtMriStudyInfoProps = {
  info: CtMriStudyInfo;
};

export function CtMriStudyInfoBlock({ info }: CtMriStudyInfoProps) {
  const patientName = [info.patientLastName, info.patientFirstName, info.patientPatronymic]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Title level={4} style={{ marginTop: 0 }}>
        Исследование {info.marking}-{info.number}
        {info.studyDate ? ` от ${info.studyDate}` : ""}
      </Title>
      <Flex vertical gap={12}>
        <Flex vertical gap={4}>
          <Text type="secondary" strong>
            Пациент
          </Text>
          <Title level={5} style={{ margin: 0 }}>
            {patientName || "—"}
          </Title>
        </Flex>
        <Flex vertical gap={4}>
          <Text type="secondary" strong>
            Дата рождения
          </Text>
          <Text>{info.birthDate ?? "—"}</Text>
        </Flex>
        <Flex vertical gap={4}>
          <Text type="secondary" strong>
            Локализация
          </Text>
          <Text>{info.localization ?? "—"}</Text>
        </Flex>
        {info.statusLabel ? (
          <Badge
            status="success"
            text={
              <Text>
                <DisconnectOutlined /> {info.statusLabel}
              </Text>
            }
          />
        ) : null}
      </Flex>
    </>
  );
}
