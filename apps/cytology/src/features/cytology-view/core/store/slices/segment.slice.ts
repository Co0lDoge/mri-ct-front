import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import uuid from "react-uuid";

import { IGroupedSegments, ISegmentStack, SegmentType } from "@cytology/core/types/segments";
import { IPoint } from "@cytology/CytologyView/CytologyViewer/Viewer/interfaces/queries";

interface segmentState {
    currentSegment: SegmentType | null;
    segmentStack: IGroupedSegments[];
    initSegmentStack: IGroupedSegments[];
}

const initialState: segmentState = {
    currentSegment: null,
    segmentStack: [],
    initSegmentStack: [],
};

const segmentSlice = createSlice({
    name: "segmentSlice",
    initialState,
    reducers: {
        setCurrentSegment: (state, action: PayloadAction<SegmentType | null>) => {
            state.currentSegment = action.payload;
        },
        setSegmentsStack: (state, action: PayloadAction<IGroupedSegments[]>) => {
            state.segmentStack = action.payload;
        },
        addNewSegmentToStack: (
            state,
            action: PayloadAction<{ seg_type: SegmentType; points: IPoint[] }>
        ) => {
            const segment: ISegmentStack = {
                ...action.payload,
                is_ai: false,
                isNew: true,
                id: uuid(),
            };
            const existedSegType = state.segmentStack.find(
                (item) => item.seg_type === action.payload.seg_type
            );

            if (existedSegType) {
                existedSegType.segments.push(segment);
            } else {
                state.segmentStack.push({ seg_type: action.payload.seg_type, segments: [segment] });
            }
        },
        editPointSegment: (
            state,
            action: PayloadAction<{ id: number | string; segType: SegmentType; points: IPoint[] }>
        ) => {
            const segGroup = state.segmentStack.find(
                (item) => item.seg_type === action.payload.segType
            );
            const segmentEdited = (segGroup ? segGroup.segments : []).find(
                (segment) => segment.id === action.payload.id
            );

            if (segmentEdited) {
                if (!segmentEdited.isNew && !segmentEdited.isDeleted) {
                    segmentEdited.isEdited = true;
                }

                segmentEdited.points = action.payload.points;
            }
        },
        setInitSegments: (state, action: PayloadAction<IGroupedSegments[]>) => {
            state.initSegmentStack = action.payload;
        },
        markAsDeleted: (
            state,
            action: PayloadAction<{ id: number | string; segType: SegmentType; isNew?: boolean }>
        ) => {
            const group = state.segmentStack.find(
                (item) => item.seg_type === action.payload.segType
            );
            if (action.payload.isNew && group) {
                group.segments = group.segments.filter(
                    (segment) => segment.id !== action.payload.id
                );
            } else if (!action.payload.isNew) {
                const founded = (group?.segments || []).find(
                    (segment) => segment.id == action.payload.id
                );

                if (founded) {
                    founded.isDeleted = true;
                }
            }
        },
        markAsUnDeleted: (
            state,
            action: PayloadAction<{ id: number | string; segType: SegmentType }>
        ) => {
            const group = state.segmentStack.find(
                (item) => item.seg_type === action.payload.segType
            );
            const founded = (group?.segments || []).find(
                (segment) => segment.id == action.payload.id
            );

            if (founded) {
                founded.isDeleted = false;
            }
        },
        addNewGroupedType: (state, action: PayloadAction<SegmentType>) => {
            state.segmentStack.push({ seg_type: action.payload, segments: [] });
        },
    },
});

export const {
    setCurrentSegment,
    setSegmentsStack,
    addNewSegmentToStack,
    editPointSegment,
    setInitSegments,
    markAsDeleted,
    markAsUnDeleted,
    addNewGroupedType,
} = segmentSlice.actions;

export default segmentSlice;
