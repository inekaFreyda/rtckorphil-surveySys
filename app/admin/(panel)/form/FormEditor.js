"use client";
import { useState } from "react";

const TYPES = [
  ["radio", "Multiple choice"], ["text", "Short text"], ["textarea", "Long text"],
  ["number", "Number"], ["date", "Date"], ["email", "Email"], ["scale", "Agreement scale (1–5 + N/A)"],
];
const typeName = Object.fromEntries(TYPES);

async function call(url, method, body) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return res.ok ? { question: data.question } : { error: data.error || "Could not save." };
}

const Badge = ({ children, color = "#eceefb" }) => (
  <span style={{ background: color, borderRadius: 999, padding: "2px 10px", fontSize: ".75rem", marginLeft: 6 }}>{children}</span>
);

function Editor({ q, advanced, onSaved, onCancel }) {
  const canStructure = !q.locked || advanced;
  const [label, setLabel] = useState(q.label);
  const [optionsText, setOptionsText] = useState(q.options.join("\n"));
  const [required, setRequired] = useState(q.required);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const body = { label, advanced };
    if (canStructure) {
      body.required = required;
      if (q.type === "radio") body.options = optionsText.split("\n");
    }
    const r = await call(`/api/admin/questions/${q.key}`, "PUT", body);
    setBusy(false);
    r.error ? setError(r.error) : onSaved(r.question);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <label className="uk-form-label">Question</label>
      <textarea className="uk-textarea" rows={2} maxLength={300} value={label} onChange={(e) => setLabel(e.target.value)} />
      {q.type === "radio" && (
        <>
          <label className="uk-form-label" style={{ display: "block", marginTop: 10 }}>Choices (one per line)</label>
          <textarea className="uk-textarea" rows={Math.min(8, q.options.length + 1)} disabled={!canStructure}
            value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />
          {q.rule && <p className="hint">The skip rule uses choice positions, so keep the order the same.</p>}
        </>
      )}
      <label style={{ display: "block", marginTop: 10 }}>
        <input type="checkbox" className="uk-checkbox" disabled={!canStructure} checked={required}
          onChange={(e) => setRequired(e.target.checked)} /> Required
      </label>
      {!canStructure && <p className="hint">Standard question: only the wording can be changed. Turn on Advanced editing to change more.</p>}
      {error && <p className="err">{error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="uk-btn uk-btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        <button className="uk-btn uk-btn-default" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </div>
  );
}

function AddQuestion({ sections, onAdded }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ section: "about", type: "text", label: "", optionsText: "", required: true });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function add() {
    setBusy(true);
    const r = await call("/api/admin/questions", "POST", {
      section: f.section, type: f.type, label: f.label, required: f.required,
      options: f.type === "radio" ? f.optionsText.split("\n") : [],
    });
    setBusy(false);
    if (r.error) return setError(r.error);
    onAdded(r.question);
    setF({ section: f.section, type: "text", label: "", optionsText: "", required: true });
    setError("");
    setOpen(false);
  }

  if (!open) return <button className="uk-btn uk-btn-primary" onClick={() => setOpen(true)}>+ Add question</button>;
  return (
    <div className="panel" style={{ marginBottom: 0 }}>
      <h2>New question</h2>
      <div className="fields">
        <div><label className="uk-form-label">Section</label>
          <select className="uk-select" value={f.section} onChange={set("section")}>
            {Object.entries(sections).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select></div>
        <div><label className="uk-form-label">Type</label>
          <select className="uk-select" value={f.type} onChange={set("type")}>
            {TYPES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select></div>
      </div>
      <label className="uk-form-label" style={{ display: "block", marginTop: 12 }}>Question</label>
      <textarea className="uk-textarea" rows={2} maxLength={300} value={f.label} onChange={set("label")} />
      {f.type === "radio" && (
        <>
          <label className="uk-form-label" style={{ display: "block", marginTop: 10 }}>Choices (one per line)</label>
          <textarea className="uk-textarea" rows={4} value={f.optionsText} onChange={set("optionsText")} />
        </>
      )}
      <label style={{ display: "block", marginTop: 10 }}>
        <input type="checkbox" className="uk-checkbox" checked={f.required} onChange={set("required")} /> Required
      </label>
      {error && <p className="err">{error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="uk-btn uk-btn-primary" onClick={add} disabled={busy}>{busy ? "Adding…" : "Add question"}</button>
        <button className="uk-btn uk-btn-default" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
      </div>
    </div>
  );
}

export default function FormEditor({ initial, sections }) {
  const [qs, setQs] = useState(initial);
  const [advanced, setAdvanced] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const replace = (q) => setQs((p) => p.map((x) => (x.key === q.key ? q : x)));

  function toggleAdvanced(on) {
    if (on && !window.confirm("These questions follow the official CSM form. Changing them may affect your reports. Unlock them?")) return;
    setAdvanced(on);
  }

  async function toggleHidden(q) {
    setError("");
    const r = await call(`/api/admin/questions/${q.key}`, "PUT", { active: !q.active, advanced });
    r.error ? setError(r.error) : replace(r.question);
  }

  return (
    <>
      <div className="panel">
        <h2>Form editor</h2>
        <p className="hint">Changes appear on the public form right away. Hidden questions keep their past answers.</p>
        <label>
          <input type="checkbox" className="uk-checkbox" checked={advanced} onChange={(e) => toggleAdvanced(e.target.checked)} />{" "}
          <b>Advanced editing:</b> unlock standard questions (CC1–CC3, SQD0–8)
        </label>
        {error && <p className="err">{error}</p>}
      </div>

      {Object.entries(sections).map(([sec, name]) => (
        <div className="panel" key={sec}>
          <h2>{name}</h2>
          {qs.filter((q) => q.section === sec).map((q) => {
            const locked = q.locked && !advanced;
            return (
              <div className="q" key={q.key} style={{ opacity: q.active ? 1 : 0.55 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div>
                    <b>{q.locked && `${q.key.toUpperCase()}. `}</b>{q.label}
                    <div style={{ marginTop: 6 }}>
                      <Badge>{typeName[q.type]}</Badge>
                      <Badge>{q.required ? "Required" : "Optional"}</Badge>
                      {q.locked && <Badge color="#fdf0c8">Standard</Badge>}
                      {!q.active && <Badge color="#f1d5d5">Hidden</Badge>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button className="uk-btn uk-btn-default" onClick={() => setEditing(editing === q.key ? null : q.key)}>Edit</button>
                    <button className="uk-btn uk-btn-default" disabled={locked} onClick={() => toggleHidden(q)}>
                      {q.active ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {editing === q.key && (
                  <Editor q={q} advanced={advanced} onCancel={() => setEditing(null)}
                    onSaved={(u) => { replace(u); setEditing(null); }} />
                )}
              </div>
            );
          })}
        </div>
      ))}

      <AddQuestion sections={sections} onAdded={(q) => setQs((p) => [...p, q])} />
    </>
  );
}