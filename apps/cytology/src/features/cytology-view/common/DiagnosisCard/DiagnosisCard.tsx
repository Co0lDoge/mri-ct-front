import React from "react";
import { Flex, Typography } from "antd";

import { Modals } from "@cytology/core/types/basic";
import { segmentsTranslated, SegmentType } from "@cytology/core/types/segments";

import "./DiagnosisCard.css";

const { Title } = Typography;

function withAlpha(color: string, alpha: number): string {
    const hex = color.trim().replace("#", "");
    if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) {
        return color;
    }
    const normalized =
        hex.length === 3
            ? hex
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : hex;
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface CytologyDiagnosisCardProps {
    segmentType: SegmentType;
    label?: string;
    color?: string;
    isActive?: boolean;
    onClick: () => void;
    editMode?: boolean;
    openModal?: (modalType: Modals | null) => void;
}

const DiagnosisCard: React.FC<CytologyDiagnosisCardProps> = ({
    segmentType,
    label,
    color,
    isActive = false,
    onClick,
    editMode = false,
    openModal: setModalType,
}) => {
    const hasColor = Boolean(color?.trim());
    const classNames = [
        "cytology-diagnosis-card",
        isActive ? "active" : "",
        hasColor ? "cytology-diagnosis-card--colored" : "",
    ]
        .filter(Boolean)
        .join(" ");
    const styles = editMode ? "edit " : "";

    const cardStyle: React.CSSProperties | undefined = hasColor
        ? {
              borderLeftColor: color,
              backgroundColor: withAlpha(color!, isActive ? 0.16 : 0.09),
              ...(isActive
                  ? {
                        borderColor: color,
                        boxShadow: `inset 0 0 0 1px ${withAlpha(color!, 0.45)}`,
                    }
                  : {}),
          }
        : undefined;

    // if (node.tirads === "tirads_5") {
    //     styles += "diagnosis-red";
    // } else if (node.tirads === "tirads_23") {
    //     styles += "diagnosis-green";
    // } else if (node.tirads === "tirads_4") {
    //     styles += "diagnosis-orange";
    // }

    // const disablePropagation = (e: { stopPropagation: () => void }, callback: () => void) => {
    //     e.stopPropagation();
    //     callback();
    // };

    return (
        <Flex
            className={classNames}
            style={cardStyle}
            onClick={onClick}
            onDoubleClick={() => setModalType && setModalType("editNode")}
        >
            <Flex justify="space-between" align="center" className="cytology-card-content">
                <Flex align="center" gap={10}>
                    {hasColor ? (
                        <span
                            className="cytology-diagnosis-card__swatch"
                            style={{ backgroundColor: color }}
                            aria-hidden
                        />
                    ) : null}
                <Flex vertical>
                    {/* <Title level={5} className="mt-0 align-start" type="secondary"> */}
                    {/* {editMode && (
                            <Tooltip title="Для смены типа образования дважды нажмите на узел">
                                <InfoCircleOutlined />
                            </Tooltip>
                        )}{" "} */}
                    {/* {isToDelete && <DeleteOutlined />} */}
                    {/* </Title> */}
                    <Title
                        level={5}
                        className={`diagnosis mt-0 ${styles}`}
                        style={hasColor ? { color: color } : undefined}
                    >
                        {label ?? segmentsTranslated[segmentType]}
                    </Title>
                </Flex>
                </Flex>
                {/* {editMode && node.specialist !== "ai" && (
                    <Tooltip title={isToDelete ? "Удалить узел" : "Отменить удаление узла"}>
                        <Button
                            onClick={(e) =>
                                !isToDelete
                                    ? deleteNode && disablePropagation(e, () => deleteNode(node.id))
                                    : undoDeleteNode &&
                                      disablePropagation(e, () => undoDeleteNode(node.id))
                            }
                        >
                            {!isToDelete && <DeleteOutlined />}
                            {isToDelete && <UndoOutlined />}
                        </Button>
                    </Tooltip>
                )} */}
            </Flex>
        </Flex>
    );
};

export default DiagnosisCard;
