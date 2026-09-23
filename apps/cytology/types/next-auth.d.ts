import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    accessTokenExpiry: string;
  }

  interface User {
    data?: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiry: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    accessTokenExpiry: string;
    refreshToken: string;
  }
}
