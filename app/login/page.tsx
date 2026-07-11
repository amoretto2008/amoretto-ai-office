"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!password.trim()) {
      alert("パスワードを入力してください。");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "ログインに失敗しました。");
        return;
      }

      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md">
        <header className="rounded-3xl bg-amoretto-navy px-5 py-6 text-amoretto-ivory shadow-lg">
          <p className="text-sm tracking-[0.25em] text-amoretto-gold">
            AMORÉTTO
          </p>
          <h1 className="mt-2 text-3xl font-semibold">AI社員オフィス</h1>
          <p className="mt-3 text-sm leading-7 text-amoretto-ivory/85">
            ご利用にはパスワードが必要です。
          </p>
        </header>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow">
          <label className="block">
            <span className="text-sm font-semibold">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold"
              placeholder="パスワードを入力"
            />
          </label>

          <button
            onClick={login}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-amoretto-navy px-5 py-4 font-semibold text-white shadow disabled:opacity-60"
          >
            {loading ? "確認中です…" : "ログインする"}
          </button>
        </section>
      </div>
    </main>
  );
}
