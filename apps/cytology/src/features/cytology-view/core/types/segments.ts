import type { IPoint } from "../../CytologyView/CytologyViewer/Viewer/interfaces/queries";
import { IPaginated } from "./basic";

export type GroupType = "CE" | "CL" | "ME";
export type SegmentType =
    | "NIL"
    | "NIR"
    | "NIM"
    | "CNO"
    | "CGE"
    | "C2N"
    | "CPS"
    | "CFC"
    | "CLY"
    | "SOS"
    | "SDS"
    | "SMS"
    | "STS"
    | "SPS"
    | "SNM"
    | "STM"
    | "PFS";

export const segmentTypes: SegmentType[] = [
    "NIL",
    "NIR",
    "NIM",
    "CNO",
    "CGE",
    "C2N",
    "CPS",
    "CFC",
    "CLY",
    "SOS",
    "SDS",
    "SMS",
    "STS",
    "SPS",
    "SNM",
    "STM",
    "PFS"
];

export const segmentsTranslated: Record<SegmentType, string> = {
    SNM: "Скопление без метастаза",
    STM: "Скопление с метастазом",
    CNO: "Клетки ЩЖ (норма)",
    CGE: "Клетки ЩЖ Гюртле",
    C2N: "Клетки ЩЖ с 2 или более ядрами",
    CPS: "Клетка ЩЖ с псевдоисключением",
    CFC: "Клетки ЩЖ с бородой в ядре",
    CLY: "Лимфоциты",
    SOS: "Бесформенная структура с упорядоченным расположением клеток",
    SDS: "Бесформенная структура с неупорядоченным расположением клеток",
    SMS: "Микрофолликулярная структура",
    STS: "Трабекулярная структура",
    SPS: "Папиллярная структура",
    NIL: "Нет информации о клетках",
    NIR: "Нет информации о скоплениях",
    NIM: "Нет информации о метастазе",
    PFS: "Парафолликулярная структура"
};

export type ISegmentResponse = IPaginated<ISegment>;

export interface ISegment {
    id: number;
    data: ISegmentData[];
    group_type: GroupType;
    seg_type: SegmentType;
    is_ai: boolean;
}

export interface ISegmentStack {
    id: number | string;
    details?: ISegmentDetails;
    points: IPoint[];
    seg_type: SegmentType;
    is_ai?: boolean;
    isNew?: boolean;
    isEdited?: boolean;
    isDeleted?: boolean;
}

export interface ISegmentData {
    id: number;
    points: ISegmentPoint[];
    details: ISegmentDetails;
}

export interface ISegmentPoint {
    id: number;
    uid: number;
    x: number;
    y: number;
}

export interface ISegmentDetails {
    area: number;
    probs: number[];
    min_d: number;
    max_d: number;
    aspect_ratio: number;
    circularity: number;
    nuclear_cytoplasmic_ratio: number;
}

export interface IGroupedSegments {
    seg_type: SegmentType;
    segments: ISegmentStack[];
}

export interface ISegmentCreate {
    data: {
        points: IPoint[];
    };
    seg_type: SegmentType;
}

export interface ISegmentType {
    code: string;
    label: string;
    color: string;
}
