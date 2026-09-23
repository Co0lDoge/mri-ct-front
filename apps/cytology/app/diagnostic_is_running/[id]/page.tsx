"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { DiagnosticIsRunningView } from "@/features/diagnostic-running/DiagnosticIsRunningView";

export default function DiagnosticIsRunningPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cytologyId = params.id?.trim() ?? "";

  const onReady = useCallback(
    (readyId: string) => {
      router.replace(`/diagnosis_is_complete/${encodeURIComponent(readyId)}`);
    },
    [router]
  );

  const onUploadAgain = useCallback(() => {
    router.push("/upload_photo");
  }, [router]);

  return (
    <DiagnosticIsRunningView
      cytologyId={cytologyId}
      onReady={onReady}
      onUploadAgain={onUploadAgain}
    />
  );
}
