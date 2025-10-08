import { Suspense } from "react";
import LoginClient from "./login-client";

// Bail out of static generation (optional but helpful for login pages)
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
