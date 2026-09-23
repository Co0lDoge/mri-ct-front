"use client";

import { useMemo } from "react";
import { signIn } from "next-auth/react";

import { unwrapMutation, useAppDispatch, setToken, setRefreshToken } from "@medml/store";
import { useLoginMutation, useRegisterUserMutation } from "@/lib/authApi";
import { AuthLayout, AuthApiProvider } from "@medml/auth";
import type { IAuthApi } from "@medml/auth";

const AuthLayoutWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterUserMutation();
  const loginWithUnwrap = unwrapMutation(loginMutation);
  const registerWithUnwrap = unwrapMutation(registerMutation);

  const stubAuthApi: IAuthApi = useMemo(
    () => ({
      login: async (payload) => {
        const data = await loginWithUnwrap(payload);
        dispatch(setToken(data.accessToken));
        dispatch(setRefreshToken(data.refreshToken));
        const result = await signIn("credentials", {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          redirect: false,
        });
        if (!result?.ok) {
          throw new Error(result?.error ?? "Не удалось создать сессию");
        }
        return data;
      },
      register: async (payload) => {
        await registerWithUnwrap(payload);
      },
    }),
    [loginWithUnwrap, registerWithUnwrap, dispatch]
  );

  return (
    <AuthApiProvider api={stubAuthApi}>
      <AuthLayout>{children}</AuthLayout>
    </AuthApiProvider>
  );
};

export default AuthLayoutWrapper;

