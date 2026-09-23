import { Navigate, useParams, useSearchParams } from "react-router-dom";

/**
 * Старый URL: `/result?id=1` или `/result/1` (SPA из thyroid-ultrasound-intelligent-assistant-front).
 * Новый: `/uzi_view/1`
 */
export default function LegacyResultRedirect() {
  const { uziId: uziIdParam } = useParams<{ uziId?: string }>();
  const [searchParams] = useSearchParams();
  const id =
    uziIdParam?.trim() ??
    searchParams.get("id")?.trim() ??
    searchParams.get("result")?.trim();

  if (id) {
    return <Navigate to={`/uzi_view/${encodeURIComponent(id)}`} replace />;
  }

  return <Navigate to="/patients" replace />;
}
