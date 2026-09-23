import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flex, Typography } from "antd";
import { FileImageOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "@cytology/core/hooks";
import { addNewSegmentToStack, editPointSegment } from "@cytology/core/store";

import { Tools } from "@cytology/core/types/basic";
import { ISegmentStack } from "@cytology/core/types/segments";
import { IPoint } from "./Viewer/interfaces/queries";

import EditPanel from "./EditPanel/EditPanel";
import CytologyOsdViewer from "./CytologyOsdViewer";

import "./CytologyViewer.css";

interface CytologyViewerProps {
    imageUrl: string | undefined;
    isEditMode: boolean;
    segments: ISegmentStack[];
    segmentTypeColors?: Record<string, string>;
    /** Высота области снимка; приходит из режима фокуса на странице. */
    height?: number | string;
}

const CytologyViewer: React.FC<CytologyViewerProps> = ({
    imageUrl,
    isEditMode,
    segments,
    segmentTypeColors = {},
    height = 600,
}) => {
    const dispatch = useAppDispatch();
    const currentSegment = useAppSelector((state) => state.segment.currentSegment);
    const segmentStack = useAppSelector((state) => state.segment.segmentStack);

    const [tool, setTool] = useState<Tools>("move");
    const currentSegmentRef = useRef(currentSegment);
    const segmentStackRef = useRef(segmentStack);

    useEffect(() => {
        currentSegmentRef.current = currentSegment;
    }, [currentSegment]);

    useEffect(() => {
        segmentStackRef.current = segmentStack;
    }, [segmentStack]);

    const handleAddSegment = useCallback(
        (contour: IPoint[]) => {
            if (currentSegmentRef.current) {
                dispatch(
                    addNewSegmentToStack({ seg_type: currentSegmentRef.current, points: contour })
                );
            }
        },
        [dispatch]
    );

    const handleChangeSegment = useCallback(
        (segmentId: string, contour: IPoint[]) => {
            const editedSegment = segmentStackRef.current
                .flatMap((item) => item.segments)
                .find((segment) => String(segment.id) === String(segmentId));

            if (editedSegment) {
                dispatch(
                    editPointSegment({
                        id: editedSegment.id,
                        segType: editedSegment.seg_type,
                        points: contour,
                    })
                );
            }
        },
        [dispatch]
    );

    const hasImage = Boolean(imageUrl?.trim());

    return (
        <div className="cytology-viewer-root">
            {isEditMode ? <EditPanel tool={tool} setTool={setTool} /> : null}
            <Flex justify="center" align="stretch" className="cytology-viewer" style={{ height }}>
                {!hasImage ? (
                    <Flex vertical align="center" justify="center" className="cytology-viewer-empty">
                        <FileImageOutlined className="cytology-viewer-empty-icon" />
                        <Typography.Paragraph className="cytology-viewer-empty-text">
                            Снимок загружается или недоступен
                        </Typography.Paragraph>
                    </Flex>
                ) : (
                    <CytologyOsdViewer
                        tool={tool}
                        imageUrl={imageUrl!}
                        segments={segments}
                        segmentTypeColors={segmentTypeColors}
                        drawingEnabled={isEditMode}
                        selected={!!currentSegment}
                        needPopup
                        height={height}
                        addSegment={handleAddSegment}
                        changeSegment={handleChangeSegment}
                    />
                )}
            </Flex>
        </div>
    );
};

export default CytologyViewer;
