import type { SeriesConfig } from "../types";

export type CtMriStudyInfo = {
  marking?: string;
  number?: string;
  studyDate?: string;
  patientLastName?: string;
  patientFirstName?: string;
  patientPatronymic?: string;
  birthDate?: string;
  localization?: string;
  statusLabel?: string;
  conclusion?: string;
};

export type CtMriDiagnosisPanelProps = {
  studyInfo: CtMriStudyInfo;
  series: SeriesConfig[];
  modality: "CT" | "MR";
  activeSeriesId?: string | null;
};
