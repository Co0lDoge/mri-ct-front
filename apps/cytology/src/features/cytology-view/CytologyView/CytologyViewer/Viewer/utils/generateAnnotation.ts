import { ShapeType } from "@annotorious/openseadragon";

import { ISegmentStack } from "@cytology/core/types/segments";

import { minMaxPoint } from "./minMaxPoint";

export const generateAnnotation = (segment: ISegmentStack) => {
    return {
        id: `${segment.id}`,
        bodies: [
            {
                id: "",
                annotation: `${segment.id}`,
                purpose: "tagging",
                value: JSON.stringify({
                    ai: segment.is_ai,
                    seg_type: segment.seg_type,
                    toDelete: segment.isDeleted,
                    toUpdate: segment.isEdited,
                    toAdd: segment.isNew,
                    details: segment.details,
                }),
            },
        ],
        target: {
            annotation: `${segment.id}`,
            selector: {
                type: ShapeType.POLYGON,
                geometry: {
                    bounds: minMaxPoint(
                        segment.points.map((segmentPoint) => ({
                            x: segmentPoint.x,
                            y: segmentPoint.y,
                        }))
                    ),
                    points: segment.points.map((segmentPoint) => [segmentPoint.x, segmentPoint.y]),
                },
            },
        },
    };
};
