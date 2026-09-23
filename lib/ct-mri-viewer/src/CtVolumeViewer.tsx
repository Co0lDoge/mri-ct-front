"use client";
import type { CtViewerConfig, SeriesConfig, SeriesGroupConfig } from "./types";
import type { CtLayoutId } from "./layout";
import { CtViewer } from "./ct-viewer/CtViewer";

export type CtSegmentPoint = {
  /** Координаты в пикселях внутри среза */
  x: number;
  y: number;
  /** Индекс среза (если сегмент 3D — можно дублировать точки на разных срезах) */
  sliceIndex?: number;
  /** Мировые координаты (опционально, на будущее) */
  worldX?: number;
  worldY?: number;
  worldZ?: number;
};

export type CtSegmentConfig = {
  /** ID сегмента (ключ для UI и логики) */
  id: string;
  /** К какой серии относится сегмент */
  seriesId: string;
  /** Подпись в UI */
  label?: string;
  /** Цвет сегмента (hex), если не задан — дефолтный */
  color?: string;
  /** Видимость по умолчанию */
  visibleByDefault?: boolean;
  /** Набор координат сегмента (точки/вершины контура и т.п.) */
  points: CtSegmentPoint[];
};

export type CtVolumeViewerProps = {
  /** Полный базовый URL к данным, например "https://example.com/pacs/ID1/P1/E1". Если не задан, используется window.location.origin + pacsBasePath */
  baseUrl?: string;
  /** Базовый путь к PACS */
  pacsBasePath: string;
  /** Список серий для панели слева */
  series: SeriesConfig[];
  /** Группы серий для синхронного просмотра */
  seriesGroups?: SeriesGroupConfig[];
  /** ID серии для предзагрузки (если не задан — окна пустые) */
  initialSeriesId?: string;
  /** Модальность для окна яркости: CT или MR (мягче стартовое окно). По умолчанию CT */
  modality?: "CT" | "MR";
  /** Запасное окно [center, width], когда в данных нет WC/WW */
  defaultWindow?: [number, number];
  /** Включать ли инструмент и переключатель «Линии уровня» (Crosshairs) */
  enableCrosshairs?: boolean;
  /** Стартовая раскладка окон */
  initialLayout?: CtLayoutId;
  /** Включать ли синхронизацию видов по умолчанию */
  enableSyncScrollByDefault?: boolean;
  /** Показывать ли левую панель с сериями */
  showStudySidebar?: boolean;
  /** Встроенный режим (карточка платформы, без высоты на весь viewport) */
  embedded?: boolean;
  /** Список сегментов для отображения */
  segments?: CtSegmentConfig[];
  /** Коллбек при ошибках загрузки/инициализации */
  onError?(message: string): void;
  /** Изменение выбранного вьюпорта */
  onViewportSelectionChange?(viewportId: string | null): void;
};

export function CtVolumeViewer(props: CtVolumeViewerProps) {
  const {
    baseUrl,
    pacsBasePath,
    series,
    seriesGroups,
    initialSeriesId,
    modality,
    defaultWindow,
    enableCrosshairs,
    embedded,
  } = props;

  const config: CtViewerConfig = {
    baseUrl,
    pacsBasePath,
    series,
    seriesGroups,
    initialSeriesId,
    modality,
    defaultWindow,
    enableCrosshairs,
    embedded,
  };

  // Пока что всё поведение реализовано внутри CtViewer,
  // CtVolumeViewer является thin-wrapper над ним.
  return <CtViewer config={config} />;
}