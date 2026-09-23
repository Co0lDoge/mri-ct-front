import React from "react";
import { Button, Flex, Tag, Typography } from "antd";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";

import { classification } from "./props";
import { getHighestProbIndex } from "../../../../../../core/functions/highestProb";

const { Text } = Typography;

interface CommentPopupHeaderProps {
    ai: boolean;
    handleDeleteSegment: () => void;
    handleUndoDeleteSegment: () => void;
    isEditingMode: boolean;
    deleted?: boolean;
    probs?: number[];
}

export const CommentPopupHeader: React.FC<CommentPopupHeaderProps> = ({
    ai,
    handleDeleteSegment,
    handleUndoDeleteSegment,
    isEditingMode,
    deleted = false,
    probs,
}) => {
    const schema = {
        label: ai ? "ИИ" : "Мед специалист",
        value: probs ? getHighestProbIndex(probs) : null,
        tagColor: "blue",
    };

    return (
        <Flex align="center" justify="space-between">
            <Flex align="center" gap={10} key={schema.label}>
                {schema.value && (
                    <>
                        <Text strong>{schema.label}:</Text>
                        <Tag color={schema.tagColor}>{schema.value}</Tag>
                    </>
                )}
                {!schema.value && <Text strong>{schema.label}</Text>}
            </Flex>
            {isEditingMode && !deleted && (
                <Button onClick={handleDeleteSegment}>
                    <DeleteOutlined />
                </Button>
            )}
            {isEditingMode && deleted && (
                <Button onClick={handleUndoDeleteSegment}>
                    <UndoOutlined />
                </Button>
            )}
        </Flex>
    );
};
