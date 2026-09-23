"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { DiagnosisIsCompleteView } from "@/features/diagnosis-complete/DiagnosisIsCompleteView";

export default function DiagnosisIsCompletePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cytologyId = params.id?.trim() ?? "";

  const onOpenResult = useCallback(
    (id: string) => {
      router.push(`/cytology/${encodeURIComponent(id)}`);
    },
    [router]
  );

  const onUploadMore = useCallback(() => {
    router.push("/upload_photo");
  }, [router]);

  const onPatients = useCallback(() => {
    router.push("/patients");
  }, [router]);

  return (
    <DiagnosisIsCompleteView
      cytologyId={cytologyId}
      onOpenResult={onOpenResult}
      onUploadMore={onUploadMore}
      onPatients={onPatients}
    />
  );
}
