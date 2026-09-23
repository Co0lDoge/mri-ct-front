import { useDispatch } from "react-redux";

import type { AppDispatch } from "@cytology/core/store";

export default function useAppDispatch() {
  return useDispatch<AppDispatch>();
}
