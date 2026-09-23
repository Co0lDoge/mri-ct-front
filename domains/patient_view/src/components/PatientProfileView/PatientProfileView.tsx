'use client';

import * as React from 'react';
import { Breadcrumb, Card, Col, Divider, Empty, Flex, Row, Spin, Tag, Typography } from 'antd';
import type { BreadcrumbProps } from 'antd';

import type { PatientProfileViewModel } from '../../types';

export type PatientProfileViewProps = {
  /** Данные после маппинга из API */
  patient: PatientProfileViewModel | null | undefined;
  loading?: boolean;
  className?: string;
  /** Заголовок в карточке (по умолчанию — ФИО пациента) */
  title?: React.ReactNode;
  /** Переход к списку пациентов (первая крошка) */
  onBack?: () => void;
  backLabel?: string;
  /**
   * Вторая крошка. Если не задано — берётся ФИО пациента, иначе «Пациент» / «…» при загрузке.
   */
  breadcrumbCurrentLabel?: string;
  /** Панель действий справа от хлебных крошек */
  actions?: React.ReactNode;
  /** Блок под карточкой пациента: таблица снимков и т.д. */
  children?: React.ReactNode;
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  marginBottom: 4,
  color: 'rgba(0, 0, 0, 0.45)',
};

function diagnosisToString(diagnosis: PatientProfileViewModel['diagnosis']): string {
  if (diagnosis == null || diagnosis === '') return '—';
  return diagnosis;
}

export function PatientProfileView({
  patient,
  loading,
  className,
  title,
  onBack,
  backLabel = 'Пациенты',
  breadcrumbCurrentLabel,
  actions,
  children,
}: PatientProfileViewProps) {
  const nameInCard = title ?? patient?.fullName ?? 'Пациент';

  const currentBreadcrumbTitle =
    breadcrumbCurrentLabel ??
    (loading && !patient ? '…' : patient?.fullName?.trim() || 'Пациент');

  const breadcrumbItems = React.useMemo<BreadcrumbProps['items']>(() => {
    const current = <span style={{ color: 'rgba(0,0,0,0.88)' }}>{currentBreadcrumbTitle}</span>;
    if (!onBack) {
      return [{ title: current }];
    }
    return [
      {
        title: (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
          >
            {backLabel}
          </a>
        ),
      },
      { title: current },
    ];
  }, [onBack, backLabel, currentBreadcrumbTitle]);

  return (
    <div className={className}>
      <Flex vertical gap={16} style={{ width: '100%' }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Breadcrumb items={breadcrumbItems} style={{ margin: 0 }} />
          {actions ? <Flex gap={8}>{actions}</Flex> : null}
        </Flex>

        <Card
          styles={{ body: { padding: 24 } }}
          style={{
            borderRadius: 12,
            width: '100%',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          {loading && !patient ? (
            <Flex justify="center" align="center" style={{ minHeight: 200 }}>
              <Spin size="large" />
            </Flex>
          ) : patient ? (
            <>
              <Typography.Title level={4} style={{ margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {nameInCard}
              </Typography.Title>
              {patient.policyNumber?.trim() ? (
                <Typography.Text type="secondary" style={{ fontSize: 14, display: 'block', marginTop: 6 }}>
                  Полис {patient.policyNumber}
                </Typography.Text>
              ) : null}

              <Divider style={{ margin: '20px 0' }} />

              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12} md={8}>
                  <Typography.Text style={labelStyle}>Статус</Typography.Text>
                  <div>
                    <Tag color={patient.active ? 'processing' : 'default'} style={{ margin: 0 }}>
                      {patient.active ? 'Активен' : 'Неактивен'}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Typography.Text style={labelStyle}>Дата рождения</Typography.Text>
                  <Typography.Text style={{ fontSize: 15 }}>{patient.birthDate?.trim() ? patient.birthDate : '—'}</Typography.Text>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Typography.Text style={labelStyle}>Email</Typography.Text>
                  <Typography.Text style={{ fontSize: 15 }}>{patient.email?.trim() ? patient.email : '—'}</Typography.Text>
                </Col>
              </Row>

              <Divider style={{ margin: '20px 0' }} />

              <Typography.Text style={labelStyle}>Заболевание</Typography.Text>
              <div style={{ marginBottom: 16 }}>
                {patient.malignancy ? (
                  <Tag color="warning" style={{ margin: 0 }}>
                    Присутствует
                  </Tag>
                ) : (
                  <Typography.Text type="secondary" italic style={{ fontSize: 15 }}>
                    отсутствует
                  </Typography.Text>
                )}
              </div>
              <Typography.Text style={labelStyle}>Диагноз</Typography.Text>
              <Typography.Paragraph
                style={{
                  marginBottom: 0,
                  marginTop: 4,
                  whiteSpace: 'pre-wrap',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'rgba(0,0,0,0.85)',
                }}
              >
                {diagnosisToString(patient.diagnosis)}
              </Typography.Paragraph>
            </>
          ) : (
            <Empty description="Нет данных о пациенте" />
          )}
        </Card>

        {children ? <div style={{ width: '100%' }}>{children}</div> : null}
      </Flex>
    </div>
  );
}
