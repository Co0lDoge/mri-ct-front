import { skipToken } from "@reduxjs/toolkit/query";

import {
  useAddReviseCopyMutation,
  useAddSegmentMutation,
  useGetCytologyHistoryQuery as useGetCytologyHistoryQueryBase,
  useGetCytologyInfoQuery as useGetCytologyInfoQueryBase,
  useGetCytologyTypesQuery as useGetCytologyTypesQueryBase,
  useLazyGetCytologySegmentsByTypeQuery as useLazyGetCytologySegmentsByTypeQueryBase,
  usePatchCytologyInfoMutation as usePatchCytologyInfoMutationBase,
  usePatchSegmentMutation as usePatchSegmentMutationBase,
} from "@/lib/cytologyApi";

import { mapToICytology } from "../adapters/mapToICytology";
import type { ICytology, ICytologyHistory } from "../types/cytology";
import type { ISegmentType, SegmentType } from "../types/segments";
import type { IPoint } from "../../CytologyView/CytologyViewer/Viewer/interfaces/queries";

export function useGetCytologyInfoQuery(id: string | typeof skipToken) {
  const arg = id;
  const result = useGetCytologyInfoQueryBase(arg, { skip: arg === skipToken });
  const data: ICytology | undefined = result.data ? mapToICytology(result.data) : undefined;
  return { ...result, data };
}

export function useGetCytologyTypesQuery(id: string | typeof skipToken) {
  const arg = id;
  return useGetCytologyTypesQueryBase(arg, { skip: arg === skipToken }) as ReturnType<
    typeof useGetCytologyTypesQueryBase
  > & { data?: ISegmentType[] };
}

export const useLazyGetCytologySegmentsByTypeQuery = useLazyGetCytologySegmentsByTypeQueryBase;

export { useAddSegmentMutation } from "@/lib/cytologyApi";

export function usePatchSegmentMutation() {
  const [patch, state] = usePatchSegmentMutationBase();
  const patchWithPoints = (args: { segmentId: string | number; points: IPoint[] }) =>
    patch({ segmentId: args.segmentId, body: { points: args.points } });
  return [patchWithPoints, state] as const;
}

export { useDeleteSegmentMutation } from "@/lib/cytologyApi";

export const useAddNewReviseMutation = useAddReviseCopyMutation;

export const usePatchCytologyInfoMutation = usePatchCytologyInfoMutationBase;

export function useGetCytologyHistoryQuery(id: string | typeof skipToken) {
  const arg = id;
  return useGetCytologyHistoryQueryBase(arg, { skip: arg === skipToken }) as ReturnType<
    typeof useGetCytologyHistoryQueryBase
  > & { data?: ICytologyHistory };
}
