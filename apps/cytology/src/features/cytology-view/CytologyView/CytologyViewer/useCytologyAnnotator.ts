import { useCallback, useEffect, useRef, useState } from "react";
import { createOSDAnnotator } from "@annotorious/openseadragon";
import type {
    Annotation,
    DrawingStyleExpression,
    ImageAnnotation,
    OpenSeadragonAnnotator,
    PolygonGeometry,
    RectangleGeometry,
} from "@annotorious/openseadragon";
import type { ViewerInstance } from "@medml/viewers";

import { Tools } from "@cytology/core/types/basic";
import { ISegmentStack } from "@cytology/core/types/segments";

import { generateAnnotation } from "./Viewer/utils/generateAnnotation";
import { IPoint } from "./Viewer/interfaces/queries";

import "@annotorious/openseadragon/annotorious-openseadragon.css";

/**
 * Слой аннотаций поверх инстанса OpenSeadragon из `@medml/viewers`.
 *
 * Раньше цитология поднимала собственный OpenSeadragon через
 * `<OpenSeadragonViewer>` из `@annotorious/react` — то есть держала второй
 * движок мимо общего пакета, со своей навигацией и своими настройками жестов.
 * Любая правка вьюера делалась дважды и расходилась с УЗИ.
 *
 * Теперь движок один, а Annotorious подключается к уже готовому инстансу через
 * `createOSDAnnotator` — тем же приёмом, что и в УЗИ: там к инстансу из
 * `onInstanceReady` цепляется Annotorious 2, здесь — третий.
 */

export interface UseCytologyAnnotatorOptions {
    segments: ISegmentStack[];
    style?: DrawingStyleExpression<ImageAnnotation>;
    /** Разрешено ли рисовать: в режиме просмотра и на инструменте «перемещение» — нет. */
    drawingEnabled: boolean;
    tool: Tools;
    onAddSegment: (contour: IPoint[]) => void;
    onChangeSegment: (segmentId: string, contour: IPoint[]) => void;
}

export interface UseCytologyAnnotatorResult {
    /** `null`, пока вьюер не открыл изображение. */
    annotator: OpenSeadragonAnnotator | null;
    /** Для `onInstanceReady` общего вьюера. */
    attach: (viewer: ViewerInstance) => void;
    /** Для `onInstanceWillDestroy` общего вьюера. */
    detach: () => void;
}

type Geometry = Partial<RectangleGeometry> & Partial<PolygonGeometry>;

/** Контур из геометрии Annotorious: у прямоугольника углы считаем сами. */
function contourFromAnnotation(annotation: Annotation): IPoint[] | null {
    const selector = (annotation as { target?: { selector?: { geometry?: Geometry } } }).target
        ?.selector;
    const geometry = selector?.geometry;

    if (!geometry) {
        return null;
    }

    if (Array.isArray(geometry.points)) {
        return geometry.points.map((point) => ({
            x: Math.round(point[0]),
            y: Math.round(point[1]),
        }));
    }

    const { x, y, w, h } = geometry;
    if (x === undefined || y === undefined || w === undefined || h === undefined) {
        return null;
    }

    return [
        { x: Math.round(x), y: Math.round(y) },
        { x: Math.round(x + w), y: Math.round(y) },
        { x: Math.round(x + w), y: Math.round(y + h) },
        { x: Math.round(x), y: Math.round(y + h) },
    ];
}

export function useCytologyAnnotator({
    segments,
    style,
    drawingEnabled,
    tool,
    onAddSegment,
    onChangeSegment,
}: UseCytologyAnnotatorOptions): UseCytologyAnnotatorResult {
    const [annotator, setAnnotator] = useState<OpenSeadragonAnnotator | null>(null);
    const annotatorRef = useRef<OpenSeadragonAnnotator | null>(null);

    // Обработчики держим в ref: пересоздавать аннотатор из-за нового колбэка
    // нельзя — вместе с ним со снимка пропадёт вся разметка.
    const handlersRef = useRef({ onAddSegment, onChangeSegment });

    useEffect(() => {
        handlersRef.current = { onAddSegment, onChangeSegment };
    }, [onAddSegment, onChangeSegment]);

    // Создание и уничтожение висят на колбэках вьюера, а не на эффекте: жизнь
    // аннотатора совпадает с жизнью инстанса OSD, а про неё общий вьюер
    // сообщает сам — через onInstanceReady / onInstanceWillDestroy.
    const attach = useCallback((viewer: ViewerInstance) => {
        const instance = createOSDAnnotator(viewer);

        instance.on("createAnnotation", (annotation: ImageAnnotation) => {
            const contour = contourFromAnnotation(annotation);
            if (contour) {
                handlersRef.current.onAddSegment(contour);
            }
        });

        instance.on("updateAnnotation", (annotation: ImageAnnotation) => {
            const contour = contourFromAnnotation(annotation);
            if (contour) {
                handlersRef.current.onChangeSegment(annotation.id, contour);
            }
        });

        annotatorRef.current = instance;
        setAnnotator(instance);
    }, []);

    const detach = useCallback(() => {
        const instance = annotatorRef.current;
        annotatorRef.current = null;
        setAnnotator(null);

        if (!instance) {
            return;
        }

        try {
            instance.destroy();
        } catch (error) {
            console.warn("useCytologyAnnotator: не удалось уничтожить аннотатор", error);
        }
    }, []);

    // Стиль — отдельным эффектом: он меняется при переключении режима и
    // выбранной группы сегментов, а разметка при этом остаётся прежней.
    useEffect(() => {
        annotator?.setStyle(style);
    }, [annotator, style]);

    useEffect(() => {
        if (!annotator) {
            return;
        }

        annotator.clearAnnotations();

        if (segments.length > 0) {
            annotator.setAnnotations(
                segments.flatMap((segment) => generateAnnotation(segment)) as ImageAnnotation[],
                true
            );
        }
    }, [annotator, segments]);

    useEffect(() => {
        if (!annotator) {
            return;
        }

        const canDraw = drawingEnabled && tool !== "move";

        if (canDraw) {
            annotator.setDrawingTool(tool);
        }
        annotator.setDrawingEnabled(canDraw);
    }, [annotator, drawingEnabled, tool]);

    return { annotator, attach, detach };
}
