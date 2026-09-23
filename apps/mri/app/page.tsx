"use client";

import dynamic from "next/dynamic";

const MriViewer = dynamic(() => import("./MriViewer"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 600 }}>Загрузка просмотрщика…</div>,
});

export default function Page() {
  return (
    <div style={{ padding: 24, width: "100%", maxWidth: 1600, margin: "0 auto" }}>
      <MriViewer />
    </div>
  );
}
