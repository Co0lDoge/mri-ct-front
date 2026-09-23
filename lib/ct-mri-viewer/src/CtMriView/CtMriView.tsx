"use client";
import { useMemo } from "react";
import { Card, Col, Row, Typography } from "antd";
import { CtVolumeViewer, type CtVolumeViewerProps } from "../CtVolumeViewer";
import { CtMriDiagnosisPanel } from "./CtMriDiagnosisPanel";
import { CtMriStudyInfoBlock } from "./CtMriStudyInfo";
import { defaultCtMriStudyInfo } from "./defaults";
import type { CtMriStudyInfo } from "./types";
import "./CtMriView.css";

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  width: "100%",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

export type CtMriViewProps = CtVolumeViewerProps & {
  generalStudyId?: string;
  studyInfo?: Partial<CtMriStudyInfo>;
};

export function CtMriView({
  generalStudyId,
  studyInfo: studyInfoOverride,
  modality = "CT",
  initialSeriesId,
  series,
  seriesGroups,
  ...viewerProps
}: CtMriViewProps) {
  const activeSeriesId = initialSeriesId ?? series[0]?.id ?? null;
  const studyInfo = useMemo(
    () => ({
      ...defaultCtMriStudyInfo(modality, generalStudyId),
      ...studyInfoOverride,
    }),
    [generalStudyId, modality, studyInfoOverride]
  );

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <Typography.Title level={4} style={{ margin: "0 0 16px" }}>
        Просмотр исследования
      </Typography.Title>
      <Card styles={{ body: { padding: "16px 24px 24px" } }} style={{ ...cardStyle, marginBottom: 16 }}>
        <CtMriStudyInfoBlock info={studyInfo} />
      </Card>
      <Card
        styles={{ body: { padding: "16px 24px 24px" } }}
        title="Снимок и заключение"
        style={cardStyle}
      >
        <Row className="ct-mri-view" gutter={16} wrap>
          <Col xs={24} lg={18}>
            <div className="ct-mri-viewer-wrapper">
              <CtVolumeViewer
                {...viewerProps}
                series={series}
                seriesGroups={seriesGroups}
                modality={modality}
                initialSeriesId={initialSeriesId}
                embedded
              />
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <CtMriDiagnosisPanel
              studyInfo={studyInfo}
              series={series}
              modality={modality}
              activeSeriesId={activeSeriesId}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}