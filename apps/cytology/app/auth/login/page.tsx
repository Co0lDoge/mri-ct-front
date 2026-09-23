import { LoginPage } from "@medml/auth";

type Props = {
  searchParams: { callbackUrl?: string };
};

export default function Login({ searchParams }: Props) {
  return <LoginPage callbackUrl={searchParams.callbackUrl} />;
}

