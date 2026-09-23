import { IPaginated } from "./basic";
import { IPatientInfo } from "./patient";

export type MaterialType = "GS" | "BP" | "TP" | "PTP" | "LNP";
export type DiagnosisMarking = "П11" | "Л23";

export interface ICytology {
    original_image: ICytologyImage;
    info: ICytologyInfo;
}

export interface ICytologyImage {
    id: number;
    create_date: string;
    delay_time: number;
    viewed_flag: boolean;
    image: string;
}

export interface ICytologyInfo {
    patient: IPatientInfo;
    acceptance_datetime: string;
    diagnosis: string;
    patient_card_id: number;
    id: number | string;
    is_last: boolean;
    diagnos_date: string;
    details: ICytologyInfoDetails | null;
    diagnostic_marking: DiagnosisMarking;
    diagnostic_number: number;
    material_type: MaterialType;
    calcitonin: number;
    calcitonin_in_flush: number;
    thyroglobulin: number;
    prev: null | number;
    parent_prev: null | number;
    original_image: null | number;
}

export interface ICytologyInfoDetails {
    probs: number[];
    cell_characteristics: ICytologyInfoCellCharacteristics;
    cluster_characteristics: ICytologyInfoClusterCharacteristics;
}

export interface ICytologyInfoCellCharacteristics {
    cellularity: number;
    lymphocyte_num: number;
    th_norm_cell_num: number;
    mean_th_cell_area: number;
    th_groove_cell_num: number;
    th_gurtle_cell_num: number;
    mean_th_cell_diameter: number;
    mean_th_cell_circularity: number;
    mean_th_cell_aspect_ratio: number;
    th_multiple_nuclei_cell_num: number;
    th_pseudoinclusion_cell_num: number;
    mean_th_cell_nuclear_cytoplasmic_ratio: number;
}

export interface ICytologyInfoClusterCharacteristics {
    papillary_num: number;
    trabecula_num: number;
    mean_cluster_area: number;
    microfollicle_num: number;
    mean_th_cell_num_in_clusters: number;
    ordered_cells_shapeless_cluster_num: number;
    disordered_cells_shapeless_cluster_num: number;
}

export interface ICytolgyInfoPatch {
    patient_card: {
        patient: number;
        diagnosis: string;
    };
    details: {
        material_type: MaterialType;
        calcitonin: number;
        calcitonin_in_flush: number;
        thyroglobulin: number;
    };
    material_type: MaterialType;
    calcitonin: number;
    calcitonin_in_flush: number;
    thyroglobulin: number;
}

export type ICytologyHistory = IPaginated<ICytologyHistoryItem>;

export interface ICytologyHistoryItem {
    calcitonin: number;
    calcitonin_in_flush: number;
    details: ICytologyInfoDetails | null;
    diagnos_date: string;
    diagnostic_marking: DiagnosisMarking;
    diagnostic_number: number;
    id: number | string;
    is_last: boolean;
    material_type: MaterialType;
    original_image: number;
    parent_prev: number | string | null;
    patient_card: number;
    prev: number | string | null;
    thyroglobulin: number;
}
