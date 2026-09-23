"use client";

import React from "react";

import { RootProviderRedux } from "@medml/ui/next";

const RootLayoutClient = ({ children }: React.PropsWithChildren) => (
  <RootProviderRedux modality="ct">{children}</RootProviderRedux>
);

export default RootLayoutClient;
