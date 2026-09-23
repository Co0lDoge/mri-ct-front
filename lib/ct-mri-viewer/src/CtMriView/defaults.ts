import type { CtMriStudyInfo } from "./types";

export function defaultCtMriStudyInfo(
  modality: "CT" | "MR",
  studyId?: string
): CtMriStudyInfo {
  const isCt = modality === "CT";
  return {
    marking: isCt ? "КТ" : "МРТ",
    number: studyId?.trim() || "12458/26",
    studyDate: "20.03.2026",
    patientLastName: "Иванова",
    patientFirstName: "Мария",
    patientPatronymic: "Петровна",
    birthDate: "12.05.1978",
    localization: isCt ? "Надпочечники" : "Гипофиз",
    statusLabel: "Диагностика завершена",
    conclusion: isCt
      ? "Образование левого надпочечника. Рекомендуется корреляция с клинико-лабораторными данными и динамическое наблюдение."
      : "Объёмное образование области гипофиза. Дифференциальная диагностика требует сопоставления с эндокринологическим статусом.",
  };
}
