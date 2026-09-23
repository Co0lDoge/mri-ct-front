import { Badge, TableProps } from "antd";

export interface TableItem {
    id: number;
    name: string;
    references: [number, number];
    result: number;
    status: 0 | 1 | 2;
}

export const columns: TableProps<TableItem>["columns"] = [
    {
        title: "Характеристика",
        dataIndex: "name",
        sorter: (a: TableItem, b: TableItem) => a.name.localeCompare(b.name),
    },
    {
        title: "Референсные значения",
        dataIndex: "references",
        render: (references: TableItem["references"]) =>
            references[0] === references[1] ? references[0] : `${references[0]} - ${references[1]}`,
    },
    {
        title: "Результат",
        dataIndex: "result",
        key: "result",
    },
    {
        title: "Оценка",
        dataIndex: "status",
        render: (status: TableItem["status"]) => (
            <>
                {status === 0 && <Badge color="green" text="Норма" />}
                {status === 1 && <Badge color="orange" text="Отклонение" />}
                {status === 2 && <Badge color="red" text="Нарушение" />}
            </>
        ),
        sorter: (a: TableItem, b: TableItem) => a.status - b.status,
    },
];

export const characteristicsDict = {
    cellularity: {
        name: "Клеточность",
        normStart: 0,
        normEnd: 1000,
        ref: true,
    },
    lymphocyte_num: {
        name: "Лимфоциты",
        normStart: 0,
        normEnd: 1000,
        ref: true,
    },
    th_norm_cell_num: {
        name: "Клетки ЩЖ (норма)",
        normStart: 6,
        normEnd: 1000,
        ref: true,
    },
    mean_th_cell_diameter: {
        name: "Средний диаметр клетки",
        normStart: 6,
        normEnd: 1000,
        ref: true,
    },
    mean_th_cell_num_in_clusters: {
        name: "Среднее количество клеток в структуре",
        normStart: 6,
        normEnd: 1000,
        ref: true,
    },
    mean_th_cell_area: {
        name: "Средняя площадь клетки",
        normStart: 6,
        normEnd: 1000,
        ref: true,
    },
    th_gurtle_cell_num: {
        name: "Клетки ЩЖ Гюртле",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    th_multiple_nuclei_cell_num: {
        name: "Клетки ЩЖ с 2 ядрами",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    th_pseudoinclusion_cell_num: {
        name: "Клетки ЩЖ с псевдоисключением",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    mean_cluster_area: {
        name: "Средняя площадь структуры",
        normStart: 6,
        normEnd: 1000,
        ref: true,
    },
    th_groove_cell_num: {
        name: "Клетки ЩЖ с бородой в ядре",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    ordered_cells_shapeless_cluster_num: {
        name: "Скученная упорядоченная структура",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    disordered_cells_shapeless_cluster_num: {
        name: "Скученная бесформенная структура",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    microfollicle_num: {
        name: "Микрофолликулярная структура",
        normStart: 0,
        normEnd: 3,
        ref: true,
    },
    trabecula_num: {
        name: "Трабекулярная структура",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    papillary_num: {
        name: "Папилярная структура",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    mean_th_cell_aspect_ratio: {
        name: "Радиус ядра тиреоцитов",
        normStart: 10,
        normEnd: 70,
        ref: true,
    },
    mean_th_cell_nuclear_cytoplasmic_ratio: {
        name: "Среднее ядерно-цитоплазматическое отношение",
        normStart: 0.5,
        normEnd: 1,
        ref: true,
    },
    mean_th_cell_circularity: {
        name: "Кучность расположения тиреоцитов",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    metastasis_cluster_num: {
        name: "Количество скоплений с метастазами",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
    no_metastasis_cluster_num: {
        name: "Количество скоплений без метастазов",
        normStart: 0,
        normEnd: 0,
        ref: false,
    },
};
