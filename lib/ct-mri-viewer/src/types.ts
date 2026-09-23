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
};