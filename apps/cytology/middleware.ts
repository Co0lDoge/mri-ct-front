import { createAuthMiddleware } from "@medml/auth/middleware";

export default createAuthMiddleware({
  secret: process.env.NEXTAUTH_SECRET,
});

/** См. `DEFAULT_PROTECTED_ROUTE_MATCHER` в `@medml/auth`. */
export const config = {
  matcher: [
    "/",
    "/patients/:path*",
    "/patient_profile/:path*",
    "/upload_photo/:path*",
    "/cytology/:path*",
    "/faq/:path*",
    "/export/:path*",
    "/dialogs/:path*",
    "/history/:path*",
    "/chat/:path*",
    "/diagnostic_is_running/:path*",
    "/diagnosis_is_complete/:path*",
    "/send_patient_card/:path*",
  ],
};
