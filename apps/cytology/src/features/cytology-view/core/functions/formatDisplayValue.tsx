import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

export function formatDisplayValue(value: string | number | null | undefined): React.ReactNode {
    if (value === null || value === undefined || value === "") {
        return (
            <Text type="secondary" className="cytology-empty-value">
                Нет данных
            </Text>
        );
    }
    return value;
}

export function hasFilledValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== "";
}
