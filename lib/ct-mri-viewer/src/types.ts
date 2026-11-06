export type SeriesProjection = "AXIAL" | "SAGITTAL" | "CORONAL";

export type SeriesConfig = {
  id: string;
  /**
   * Индекс первого среза.
   * По умолчанию URL формируется как `${pacsBasePath}/${id}/I{sliceIndex}`.
   */
  sliceStart: number;
  /** Количество срезов в серии */
  sliceCount: number;
  /**
   * Необязательный префикс имени файла среза.
   * Например: "I", "IMG_", "CT_".
   * Если не задан, используется "I".
   */
  slicePrefix?: string;
  /**
   * Необязательный постфикс (суффикс) имени файла среза.
   * Например: ".dcm".
   * Если не задан, суффикс отсутствует.
   */
  slicePostfix?: string;
  /** Проекция серии (для группировки) */
  projection?: SeriesProjection;
};

export type SeriesGroupConfig = {
  groupId: string;
  label: string;
  seriesIds: string[];
};

export type CtSegmentPoint = {
  /** Координаты в пикселях внутри среза */
  x: number;
  y: number;
  /** Индекс среза (если сегмент 3D — можно дублировать точки на разных срезах) */
  sliceIndex?: number;
  /** Мировые координаты (опционально) */
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

export type CtViewerConfig = {
  /** Полный базовый URL к данным */
  baseUrl?: string;
  /** Базовый путь к данным, например "/pacs/ID1/P1/E1" */
  pacsBasePath: string;
  /** Список серий с индексами и количеством срезов */
  series: SeriesConfig[];
  /** Группы серий для синхронного просмотра */
  seriesGroups?: SeriesGroupConfig[];
  /** ID серии для предзагрузки */
  initialSeriesId?: string;
  /** Модальность для подбора окна яркости: CT или MR */
  modality?: "CT" | "MR";
  /** Окно [center, width] как запасной VOI */
  defaultWindow?: [number, number];
  /** Включать ли инструмент Crosshairs */
  enableCrosshairs?: boolean;
  /** Встроенный режим внутри карточки платформы */
  embedded?: boolean;
  /** Список сегментов для отображения */
  segments?: CtSegmentConfig[];
  /** Прямые URL к срезам (например, с сервера) */
  sliceUrls?: string[];
};
