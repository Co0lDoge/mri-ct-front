import { useSelector } from "react-redux";

import type { RootState } from "@cytology/core/store";

export default function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector);
}
