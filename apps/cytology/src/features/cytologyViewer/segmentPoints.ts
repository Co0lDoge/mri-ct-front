import type { CytologyPoint } from "@/lib/cytologyApi";

export const formatPointsJson = (points: CytologyPoint[]): string =>
  JSON.stringify(
    points.map((point) => ({ x: point.x, y: point.y })),
    null,
    2
  );

export const parsePointsJson = (value: string): CytologyPoint[] => {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Ожидается JSON-массив точек.");
  }

  return parsed.map((point, index) => {
    if (!point || typeof point !== "object") {
      throw new Error(`Некорректная точка на позиции ${index + 1}.`);
    }

    const x = Number((point as { x?: unknown }).x);
    const y = Number((point as { y?: unknown }).y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Координаты x/y обязательны для точки ${index + 1}.`);
    }

    return { x, y };
  });
};

export const buildRectanglePoints = (
  x: number,
  y: number,
  width: number,
  height: number
): CytologyPoint[] => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
];
