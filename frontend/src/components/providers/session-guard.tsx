"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return <>{children}</>;
}
