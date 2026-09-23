import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Виртуальный ассистент — МРТ",
  description: "Клиентская платформа — просмотр МРТ-исследований",
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="ru" className={inter.className}>
    <body>
      <RootLayoutClient>{children}</RootLayoutClient>
    </body>
  </html>
);

export default RootLayout;
