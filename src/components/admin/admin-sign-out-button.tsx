"use client";

import { defaultSignOutAccount } from "@tgoliveira/secure-auth/react/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await defaultSignOutAccount();
      router.push("/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-subtle)] disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
