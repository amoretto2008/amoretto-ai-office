"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-full border border-white/30 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:opacity-60"
    >
      {loading ? "ログアウト中…" : "ログアウト"}
    </button>
  );
}
