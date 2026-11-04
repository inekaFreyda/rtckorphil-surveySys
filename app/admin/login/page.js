"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError((await res.json().catch(() => ({}))).error || "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="shell" style={{ maxWidth: 440, paddingTop: 80 }}>
      <form className="panel" onSubmit={submit}>
        <h2>Admin sign in</h2>
        <p className="hint">TESDA RTC Davao · CSM</p>
        <div className="stack">
          <label className="uk-form-label">Email</label>
          <input type="email" className="uk-input" required autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="uk-form-label" style={{ marginTop: 8 }}>Password</label>
          <input type="password" className="uk-input" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="err" style={{ marginTop: 12 }}>{error}</p>}
        <button className="cta" type="submit" disabled={busy} style={{ marginTop: 16 }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}