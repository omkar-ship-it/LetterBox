"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-700 disabled:opacity-50"
    >
      <LogOut size={14} /> {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
