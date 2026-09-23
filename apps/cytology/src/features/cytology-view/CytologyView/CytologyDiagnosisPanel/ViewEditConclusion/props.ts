import type { SelectProps } from "antd";

export const localizationOptions: SelectProps["options"] = [
    {
        value: 'GS',
        label: 'Генитальный мазок',
    },
    {
        value: 'TP',
        label: 'Щитовидная железа',
    },
    {
        value: 'BP',
        label: 'Молочная железа',
    },
    {
        value: 'PTP',
        label: 'Околощитовидная железа',
    },
    {
        value: 'LNP',
        label: 'Лимфатический узел',
    },
];
