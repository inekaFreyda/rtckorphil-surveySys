"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const p = (n) => String(n).padStart(2, "0");
const toLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const toIso = (v) => (v ? new Date(v).toISOString() : null);

export default function FormStatus({ initial, accepting }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initial.isOpen);
  const [message, setMessage] = useState(initial.closedMessage);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState({ text: "", error: false });

  // Fill the date boxes after load so they use the admin's own timezone
  useEffect(() => {
    setOpensAt(toLocal(initial.opensAt));
    setClosesAt(toLocal(initial.closesAt));
  }, [initial.opensAt, initial.closesAt]);

  async function save(body, okText) {
    setBusy(true);
    setNote({ text: "", error: false });
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      setNote({ text: okText, error: false });
      router.refresh();
      return true;
    }
    setNote({ text: (await res.json().catch(() => ({}))).error || "Could not save.", error: true });
    return false;
  }

  const toggle = async () => {
    const next = !isOpen;
    if (await save({ isOpen: next }, next ? "Form opened." : "Form closed.")) setIsOpen(next);
  };

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2>Form status</h2>
          <p className="hint" style={{ margin: 0 }}>
            {accepting
              ? "The form is open and accepting responses."
              : isOpen
              ? "The switch is on, but the form is outside its scheduled dates, so it is not accepting responses."
              : "The form is closed. Visitors see your closed message."}
          </p>
        </div>
        <button className={isOpen ? "uk-btn uk-btn-default" : "uk-btn uk-btn-primary"} onClick={toggle} disabled={busy}>
          {isOpen ? "Close form" : "Open form"}
        </button>
      </div>

      <div className="q" style={{ marginTop: 20 }}>
        <label className="uk-form-label" style={{ display: "block", marginBottom: 8 }}>Message shown when closed</label>
        <textarea className="uk-textarea" rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="uk-btn uk-btn-default" style={{ marginTop: 10 }} disabled={busy}
          onClick={() => save({ closedMessage: message }, "Message saved.")}>Save message</button>
      </div>

      <div className="q">
        <label className="uk-form-label" style={{ display: "block", marginBottom: 4 }}>Schedule (optional)</label>
        <p className="hint" style={{ marginBottom: 12 }}>The form only accepts responses between these dates, while the switch above is on. Leave blank for no limit.</p>
        <div className="fields">
          <div><label className="uk-form-label">Opens</label>
            <input type="datetime-local" className="uk-input" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} /></div>
          <div><label className="uk-form-label">Closes</label>
            <input type="datetime-local" className="uk-input" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} /></div>
        </div>
        <button className="uk-btn uk-btn-default" style={{ marginTop: 10 }} disabled={busy}
          onClick={() => save({ opensAt: toIso(opensAt), closesAt: toIso(closesAt) }, "Schedule saved.")}>Save schedule</button>
      </div>

      {note.text && <p className={note.error ? "err" : "hint"} style={{ marginTop: 8 }}>{note.text}</p>}
    </div>
  );
}