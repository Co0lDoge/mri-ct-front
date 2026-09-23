"use client";

import "./Header.scss";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Card, Typography } from "antd";

import { useAppDispatch, useAppSelector, setToken } from "@medml/store";
import { HeaderIcon } from "@medml/ui";

const { Text } = Typography;

export interface HeaderNextProps {
  onLogoutClearStorage?: () => void;
}

export default function HeaderNext({ onLogoutClearStorage }: HeaderNextProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const isAuthenticated = Boolean(accessToken);
  const showLoginButton = !isAuthenticated && pathname !== "/auth/login";
  const showRegisterButton = !isAuthenticated && pathname === "/auth/login";

  const isPatientsNavActive = pathname === "/patients" || pathname.startsWith("/patient_profile");
  const isFaqActive = pathname === "/faq";
  const isViewerActive = pathname === "/" || pathname.startsWith("/viewer");

  const handleLogout = () => {
    dispatch(setToken(undefined));
    onLogoutClearStorage?.();
    router.replace("/auth/login");
  };

  return (
    <Card className="header-card">
      <div className="header-content">
        <Link href="/" className="header-icon">
          <HeaderIcon />
        </Link>

        <div className="header-links">
          <Link href="/">
            <Text type={isViewerActive ? undefined : "secondary"} className="header-nav-text">
              Просмотр
            </Text>
          </Link>

          <Link href="/patients">
            <Text type={isPatientsNavActive ? undefined : "secondary"} className="header-nav-text">
              Пациенты
            </Text>
          </Link>

          <Link href="/faq">
            <Text type={isFaqActive ? undefined : "secondary"} className="header-nav-text">
              FAQ
            </Text>
          </Link>
        </div>

        {isAuthenticated && (
          <Button type="text" onClick={handleLogout}>
            <Text className="header-nav-text">Выйти</Text>
          </Button>
        )}

        {showLoginButton && (
          <Link href="/auth/login">
            <Button className="header-button">
              <Text className="header-nav-text">Вход</Text>
            </Button>
          </Link>
        )}

        {showRegisterButton && (
          <Link href="/auth/register">
            <Button className="header-button">
              <Text className="header-nav-text">Регистрация</Text>
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
