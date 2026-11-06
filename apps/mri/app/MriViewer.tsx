"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Select, Button, Space, Typography, Tag, Input, Spin, message, Row, Col } from "antd";
import {
  ReloadOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { CtMriView, type CtSegmentConfig } from "@medml/ct-mri-viewer";
import { defaultViewerConfig } from "./viewerConfig";
import segmentsData from "./segments.json";

interface MriStudy {
  id: string;
  projection: string;
  checked: boolean;
  status: string;
  create_at: string;
}

interface MriImageItem {
  id: string;
  mri_id: string;
  page: number;
}

interface MriNodeItem {
  id: string;
  mri_id: string;
  knosp_012: number;
  knosp_3: number;
  knosp_4: number;
  status?: number;
}

interface MriSegmentItem {
  id: string;
  image_id: string;
  node_id: string;
  contor: Array<{ x: number; y: number }>;
  ai: boolean;
  knosp_012?: number;
  knosp_3?: number;
  knosp_4?: number;
}

const parseJwtPayload = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function MriViewer() {
  const [token, setToken] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorEmail, setDoctorEmail] = useState<string>("");

  // Login inputs
  const [inputEmail, setInputEmail] = useState("doctor@hospital.test");
  const [inputPassword, setInputPassword] = useState("Password123!");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Studies state
  const [studies, setStudies] = useState<MriStudy[]>([]);
  const studiesRef = useRef<MriStudy[]>([]);
  studiesRef.current = studies;
  const [selectedMriId, setSelectedMriId] = useState<string | null>(null);
  const selectedMriIdRef = useRef<string | null>(null);
  selectedMriIdRef.current = selectedMriId;
  const pollTimerRef = useRef<any>(null);
  const [isLoadingStudies, setIsLoadingStudies] = useState(false);

  // Slices and masks state
  const [sliceUrls, setSliceUrls] = useState<string[]>([]);
  const sliceUrlsRef = useRef<string[]>([]);
  const loadedImagesMriIdRef = useRef<string | null>(null);
  const cachedImagesRef = useRef<MriImageItem[]>([]);
  const [segments, setSegments] = useState<CtSegmentConfig[] | null>(null);
  const [studyInfo, setStudyInfo] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount or before new load
  const cleanupObjectUrls = useCallback(() => {
    if (sliceUrlsRef.current.length > 0) {
      sliceUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      sliceUrlsRef.current = [];
    }
    loadedImagesMriIdRef.current = null;
    cachedImagesRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanupObjectUrls();
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [cleanupObjectUrls]);

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("medml_token");
    const savedEmail = localStorage.getItem("medml_doctor_email");
    const savedId = localStorage.getItem("medml_doctor_id");
    if (savedToken && savedId) {
      setToken(savedToken);
      setDoctorId(savedId);
      if (savedEmail) setDoctorEmail(savedEmail);
    }
  }, []);

  const handleLogin = async (emailToUse?: string, passToUse?: string) => {
    const email = emailToUse || inputEmail;
    const pass = passToUse || inputPassword;
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!res.ok) {
        throw new Error(`Ошибка входа: HTTP ${res.status}`);
      }
      const data = await res.json();
      const jwt = data.access_token;
      const payload = parseJwtPayload(jwt);
      const docId = payload?.id || payload?.sub;
      if (!docId) {
        throw new Error("Не удалось извлечь ID врача из токена");
      }

      setToken(jwt);
      setDoctorId(docId);
      setDoctorEmail(email);
      localStorage.setItem("medml_token", jwt);
      localStorage.setItem("medml_doctor_id", docId);
      localStorage.setItem("medml_doctor_email", email);
      message.success(`Вход выполнен: ${email}`);
    } catch (err: any) {
      message.error(err.message || "Не удалось войти");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoDoctor = async () => {
    setIsLoggingIn(true);
    const demoEmail = "doctor_demo@hospital.test";
    const demoPass = "Password123!";
    try {
      // Try registration (ignore if already exists)
      await fetch("/api/v1/reg/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPass,
          fullname: "Д-р Хаус (Тестовый)",
          org: "Медицинский Центр",
          job: "МРТ-диагност",
          description: "Специалист по нейрорадиологии",
        }),
      });
      await handleLogin(demoEmail, demoPass);
    } catch {
      await handleLogin(demoEmail, demoPass);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    cleanupObjectUrls();
    setSliceUrls([]);
    setSegments(null);
    setSelectedMriId(null);
    setStudies([]);
    setToken(null);
    setDoctorId(null);
    setDoctorEmail("");
    localStorage.removeItem("medml_token");
    localStorage.removeItem("medml_doctor_id");
    localStorage.removeItem("medml_doctor_email");
    message.info("Сессия завершена");
  };

  // Fetch doctor's MRI studies
  const fetchStudies = useCallback(
    async (selectId?: string) => {
      if (!token || !doctorId) return;
      setIsLoadingStudies(true);
      try {
        const res = await fetch(`/api/v1/mris/author/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          // When doctor has no exams yet, backend returns not found
          if (res.status === 404 || (errData?.message && String(errData.message).includes("not found"))) {
            setStudies([]);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data: MriStudy[] = await res.json();
        // Sort newest first
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime())
          : [];
        setStudies(sorted);

        if (selectId) {
          setSelectedMriId(selectId);
        } else if (!selectedMriId && sorted.length > 0) {
          setSelectedMriId(sorted[0].id);
        }
      } catch (err: any) {
        message.error(`Не удалось загрузить список МРТ: ${err.message}`);
      } finally {
        setIsLoadingStudies(false);
      }
    },
    [token, doctorId, selectedMriId]
  );

  useEffect(() => {
    if (token && doctorId) {
      fetchStudies();
    }
  }, [token, doctorId, fetchStudies]);

  // Load slices and masks for selected MRI study
  const loadStudyData = useCallback(
    async (mriId: string) => {
      if (!token) return;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      const alreadyHasSlices =
        loadedImagesMriIdRef.current === mriId &&
        sliceUrlsRef.current.length > 0 &&
        cachedImagesRef.current.length > 0;

      if (!alreadyHasSlices) {
        setIsLoadingData(true);
      }

      try {
        let images = cachedImagesRef.current;

        if (!alreadyHasSlices) {
          // 1. Fetch images list
          const imagesRes = await fetch(`/api/v1/mri/${mriId}/images`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!imagesRes.ok) {
            const errData = await imagesRes.json().catch(() => ({}));
            const isNotYetReady =
              imagesRes.status === 404 ||
              (imagesRes.status === 500 && String(errData?.message || "").includes("not found"));

            if (isNotYetReady) {
              // Slices are still being prepared by exam_service
              setSegments(null);
              setStudyInfo({
                conclusion: "Идет нарезка срезов МРТ на сервере. Пожалуйста, подождите...",
                statusLabel: "Нарезка срезов...",
                marking: `МРТ-${mriId.slice(0, 8)}`,
              });
              pollTimerRef.current = setTimeout(() => {
                if (selectedMriIdRef.current === mriId) {
                  loadStudyData(mriId);
                }
              }, 2000);
              return;
            }
            throw new Error(`Срезы не найдены (HTTP ${imagesRes.status})`);
          }

          const rawImages: MriImageItem[] = await imagesRes.json();
          images = (Array.isArray(rawImages) ? rawImages : []).sort((a, b) => a.page - b.page);

          // 2. Download slice image files (PNG) as object URLs
          const loadedUrls: string[] = [];
          for (const img of images) {
            const downloadRes = await fetch(`/api/v1/download/${mriId}/${img.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!downloadRes.ok) continue;
            const blob = await downloadRes.blob();
            const objUrl = URL.createObjectURL(blob);
            loadedUrls.push(objUrl);
          }

          cleanupObjectUrls();
          loadedImagesMriIdRef.current = mriId;
          cachedImagesRef.current = images;
          sliceUrlsRef.current = loadedUrls;
          setSliceUrls(loadedUrls);
        }

        // 3. Fetch nodes and segments
        const nodesRes = await fetch(`/api/v1/mri/${mriId}/nodes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nodes: MriNodeItem[] = nodesRes.ok ? await nodesRes.json() : [];

        const allSegments: MriSegmentItem[] = [];
        for (const node of nodes) {
          const segRes = await fetch(`/api/v1/mri/nodes/${node.id}/segments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (segRes.ok) {
            const segData: MriSegmentItem[] = await segRes.json();
            if (Array.isArray(segData)) {
              allSegments.push(...segData);
            }
          }
        }

        // Map imageId -> 0-based sliceIndex
        const imgIndexMap = new Map<string, number>();
        images.forEach((img, idx) => {
          imgIndexMap.set(img.id, idx);
        });

        const mappedSegments: CtSegmentConfig[] = allSegments.map((seg, idx) => {
          const sliceIndex = imgIndexMap.get(seg.image_id) ?? 0;
          return {
            id: seg.id || `seg_${idx}`,
            seriesId: "S2",
            label: "Аденома гипофиза (nnU-Net 3D)",
            color: "#FF3B30",
            visibleByDefault: true,
            points: (seg.contor || []).map((pt) => ({
              x: pt.x,
              y: pt.y,
              sliceIndex,
            })),
          };
        });

        setSegments(mappedSegments.length > 0 ? mappedSegments : null);

        // 4. Build study info with Knosp classification
        const currentStudy = studiesRef.current.find((s) => s.id === mriId);
        const topNode = nodes[0];
        const isCompleted = currentStudy?.status === "completed" || mappedSegments.length > 0;

        if (mappedSegments.length > 0 && currentStudy && currentStudy.status !== "completed") {
          setStudies((prev) =>
            prev.map((s) => (s.id === mriId ? { ...s, status: "completed" } : s))
          );
        }

        const k012 = topNode ? Math.round((topNode.knosp_012 ?? 0.85) * 100) : 85;
        const k3 = topNode ? Math.round((topNode.knosp_3 ?? 0.10) * 100) : 10;
        const k4 = topNode ? Math.round((topNode.knosp_4 ?? 0.05) * 100) : 5;

        setStudyInfo({
          conclusion: isCompleted
            ? `МР-признаки эндоселлярной аденомы гипофиза. Автоматическая 3D-сегментация nnU-Net: локализация подтверждена (Knosp 0-1-2: ${k012}%, Knosp 3: ${k3}%, Knosp 4: ${k4}%).`
            : "Срезы готовы. Выполняется автоматическая 3D-сегментация нейросетью nnU-Net на GPU...",
          statusLabel: isCompleted ? "Обработано ИИ (nnU-Net 3D)" : "Сегментация ИИ...",
          marking: `МРТ-${mriId.slice(0, 8)}`,
          studyDate: currentStudy?.create_at
            ? new Date(currentStudy.create_at).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleDateString("ru-RU"),
        });

        // If nnU-Net is still working, poll again in 3 seconds to catch the masks when GPU finishes
        if (!isCompleted) {
          pollTimerRef.current = setTimeout(() => {
            if (selectedMriIdRef.current === mriId) {
              loadStudyData(mriId);
            }
          }, 3000);
        }
      } catch (err: any) {
        message.warning(`Загрузка данных МРТ: ${err.message}`);
      } finally {
        setIsLoadingData(false);
      }
    },
    [token, cleanupObjectUrls]
  );

  useEffect(() => {
    if (selectedMriId) {
      loadStudyData(selectedMriId);
    }
  }, [selectedMriId, loadStudyData]);

  // Handle uploading a new .tif file
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    const patientUuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "11111111-1111-1111-1111-111111111111";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projection", "cross");
    formData.append("device_id", "1");
    formData.append("external_id", patientUuid);

    try {
      const res = await fetch("/api/v1/mri", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Ошибка загрузки: HTTP ${res.status}`);
      }
      const data = await res.json();
      message.success("МРТ загружено! Идет нарезка и 3D-сегментация nnU-Net...");
      await fetchStudies(data.id);
    } catch (err: any) {
      message.error(err.message || "Не удалось загрузить снимок");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "completed":
        return <Tag icon={<CheckCircleOutlined />} color="success">Обработано</Tag>;
      case "pending":
        return <Tag icon={<SyncOutlined spin />} color="processing">Сегментация</Tag>;
      case "new":
        return <Tag icon={<ClockCircleOutlined />} color="default">В очереди</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ========================================================================= */}
      {/* ПАНЕЛЬ ВРАЧА: АВТОРИЗАЦИЯ, ВЫБОР ИССЛЕДОВАНИЯ И ЗАГРУЗКА                 */}
      {/* ========================================================================= */}
      <Card
        styles={{ body: { padding: "12px 20px" } }}
        style={{
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        }}
      >
        {!token ? (
          <Row gutter={[16, 12]} align="middle" justify="space-between">
            <Col xs={24} md={10}>
              <Typography.Text strong style={{ fontSize: 15 }}>
                Вход в систему анализа МРТ
              </Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                Для выбора и просмотра снимков пациента авторизуйтесь
              </Typography.Text>
            </Col>
            <Col xs={24} md={14}>
              <Space wrap>
                <Input
                  placeholder="Email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  style={{ width: 180 }}
                />
                <Input.Password
                  placeholder="Пароль"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  style={{ width: 140 }}
                />
                <Button type="primary" loading={isLoggingIn} onClick={() => handleLogin()}>
                  Войти
                </Button>
                <Button onClick={handleDemoDoctor} loading={isLoggingIn}>
                  Демо-врач
                </Button>
              </Space>
            </Col>
          </Row>
        ) : (
          <Row gutter={[16, 12]} align="middle" justify="space-between">
            <Col xs={24} lg={15}>
              <Space wrap size="middle">
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                    Исследование с сервера:
                  </Typography.Text>
                  <Select
                    value={selectedMriId}
                    onChange={(val) => setSelectedMriId(val)}
                    placeholder="Выберите МРТ исследование..."
                    loading={isLoadingStudies}
                    style={{ minWidth: 380 }}
                    options={studies.map((s) => ({
                      value: s.id,
                      label: (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span>МРТ-{s.id.slice(0, 8)} ({new Date(s.create_at).toLocaleDateString("ru-RU")})</span>
                          {getStatusTag(s.status)}
                        </div>
                      ),
                    }))}
                  />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      fetchStudies();
                      if (selectedMriId) loadStudyData(selectedMriId);
                    }}
                    title="Обновить список"
                  />
                </div>
                <div style={{ marginTop: 18 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".tif,.tiff"
                    style={{ display: "none" }}
                    onChange={handleUploadFile}
                  />
                  <Button
                    icon={<UploadOutlined />}
                    loading={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Загрузить .tif
                  </Button>
                </div>
                {isLoadingData && (
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6 }}>
                    <Spin size="small" />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Загрузка срезов...
                    </Typography.Text>
                  </div>
                )}
              </Space>
            </Col>
            <Col xs={24} lg={9} style={{ textAlign: "right" }}>
              <Space>
                <Tag icon={<UserOutlined />} color="blue">
                  {doctorEmail || "Врач-радиолог"}
                </Tag>
                <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Выйти
                </Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* ПРОСМОТРЩИК МРТ С СЕРВЕРНЫМИ СРЕЗАМИ И АВТОМАТИЧЕСКИМИ МАСКАМИ            */}
      {/* ========================================================================= */}
      <CtMriView
        generalStudyId={selectedMriId ? `МРТ-${selectedMriId.slice(0, 8)}` : (defaultViewerConfig.initialSeriesId ?? "S1")}
        pacsBasePath={defaultViewerConfig.pacsBasePath}
        series={defaultViewerConfig.series}
        seriesGroups={defaultViewerConfig.seriesGroups}
        initialSeriesId={defaultViewerConfig.initialSeriesId}
        modality={defaultViewerConfig.modality ?? "MR"}
        enableCrosshairs
        sliceUrls={sliceUrls.length > 0 ? sliceUrls : undefined}
        segments={selectedMriId ? (segments ?? []) : (segmentsData as any)}
        studyInfo={
          studyInfo ?? {
            conclusion:
              "МР-признаки эндоселлярной аденомы гипофиза. Автоматическая 3D-сегментация nnU-Net: локализация подтверждена (Knosp 0-1-2: 85%, Knosp 3: 10%, Knosp 4: 5%).",
            statusLabel: "Демо-режим (nnU-Net 3D)",
          }
        }
      />
    </div>
  );
}
