    "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function del() {
    if (!window.confirm("Delete this response permanently? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/responses/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/responses");
      router.refresh();
    } else {
      setError("Could not delete. Try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button className="uk-btn uk-btn-default" onClick={del} disabled={busy} style={{ color: "#b42318" }}>
        {busy ? "Deleting…" : "Delete response"}
      </button>
      {error && <p className="err">{error}</p>}
    </>
  );
}