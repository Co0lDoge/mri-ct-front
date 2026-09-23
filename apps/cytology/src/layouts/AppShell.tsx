import { Outlet } from "react-router-dom";

import { Footer, HeaderSpa } from "@medml/layout";

import { clearAuthTokens } from "@/lib/tokenStorage";

import "@medml/ui/providers/RootProvider/RootProvider.scss";
import "./AppShell.scss";

export default function AppShell() {
  return (
    <div className="root-layout">
      <HeaderSpa onLogoutClearStorage={clearAuthTokens} />
      <main className="root-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
