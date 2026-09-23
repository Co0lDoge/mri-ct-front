import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DiagnosisIsCompleteView } from "@/features/diagnosis-complete/DiagnosisIsCompleteView";

export default function DiagnosisIsCompleteRoute() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const cytologyId = params.id?.trim() ?? "";

  const onOpenResult = useCallback(
    (id: string) => {
      navigate(`/cytology/${encodeURIComponent(id)}`);
    },
    [navigate]
  );

  const onUploadMore = useCallback(() => {
    navigate("/upload_photo");
  }, [navigate]);

  const onPatients = useCallback(() => {
    navigate("/patients");
  }, [navigate]);

  return (
    <DiagnosisIsCompleteView
      cytologyId={cytologyId}
      onOpenResult={onOpenResult}
      onUploadMore={onUploadMore}
      onPatients={onPatients}
    />
  );
}
