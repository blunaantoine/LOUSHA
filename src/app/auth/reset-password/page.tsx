"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useStore } from "@/lib/store";
import { ResetPasswordView } from "@/components/lousha/reset-password-view";
import { AppShell } from "@/components/lousha/app-shell";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { setResetToken } = useStore();

  useEffect(() => {
    if (token) {
      setResetToken(token);
    }
  }, [token, setResetToken]);

  return (
    <AppShell>
      <ResetPasswordView />
    </AppShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <span className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
