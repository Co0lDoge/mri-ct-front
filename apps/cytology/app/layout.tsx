import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import RootLayoutClient from "./RootLayoutClient";

import "./styles/reset.scss";
import "./styles/global.scss";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Виртуальный ассистент — Цитология",
  description: "Умный помощник врача",
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="ru" className={inter.className}>
    <body>
      <RootLayoutClient>{children}</RootLayoutClient>
    </body>
  </html>
);

export default RootLayout;
