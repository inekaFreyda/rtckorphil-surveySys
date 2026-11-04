"use client";
import { useState } from "react";

const SCALE = [
  { v: "1", face: "😠", label: "Strongly Disagree" },
  { v: "2", face: "🙁", label: "Disagree" },
  { v: "3", face: "😐", label: "Neither Agree nor Disagree" },
  { v: "4", face: "🙂", label: "Agree" },
  { v: "5", face: "😄", label: "Strongly Agree" },
  { v: "NA", face: "—", label: "Not Applicable" },
];
const today = () => new Date().toISOString().slice(0, 10);

export default function SurveyForm({ questions, sections }) {
  const [a, setA] = useState(() =>
    Object.fromEntries(questions.filter((q) => q.type === "date").map((q) => [q.key, today()]))
  );
  const [status, setStatus] = useState("idle"); // idle | sending | done | error | closed
  const [honey, setHoney] = useState("");

  // A rule auto-answers a question (e.g. CC2/CC3 become N/A when CC1 = option 4)
  const auto = (q) => {
    const r = q.rule;
    if (!r) return null;
    const dep = questions.find((x) => x.key === r.dependsOn);
    return dep && a[dep.key] === dep.options[r.whenIndex] ? q.options[r.setIndex] : null;
  };
  const val = (q) => auto(q) ?? a[q.key] ?? "";
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    const answers = Object.fromEntries(questions.map((q) => [q.key, val(q)]));
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, website: honey }),
      });
      setStatus(res.ok ? "done" : res.status === 403 ? "closed" : "error");
      if (res.ok) window.scrollTo({ top: 0 });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done" || status === "closed")
    return (
      <main className="shell"><div className="panel center">
        <h2>{status === "done" ? "Thank you!" : "Survey closed"}</h2>
        <p className="hint">
          {status === "done"
            ? "Your feedback has been recorded and will help us serve you better."
            : "This survey was closed before your answers could be sent."}
        </p>
      </div></main>
    );

  const sectionKeys = [...new Set(questions.map((q) => q.section))];

  return (
    <main className="shell">
      <form onSubmit={submit}>
        {sectionKeys.map((sec) => (
          <section className="panel" key={sec}>
            <h2>{sections[sec] ?? sec}</h2>
            {questions.filter((q) => q.section === sec).map((q) => {
              const locked = auto(q) !== null;
              const name = q.key;
              return (
                <div className="q" key={q.key}>
                  <label className="uk-form-label" style={{ display: "block", marginBottom: 10 }}>
                    {q.locked && <b>{q.key.toUpperCase()}. </b>}{q.label}
                  </label>

                  {q.type === "radio" && (
                    <div className="opts">
                      {q.options.map((o) => (
                        <label key={o} className="opt">
                          <input type="radio" className="uk-radio" name={name} required={q.required && !locked}
                            disabled={locked} checked={val(q) === o} onChange={() => set(q.key, o)} /> {o}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "scale" && (
                    <div className="scale">
                      {SCALE.map((s) => (
                        <label key={s.v} className="opt">
                          <input type="radio" name={name} required={q.required}
                            checked={val(q) === s.v} onChange={() => set(q.key, s.v)} />
                          <span className="face">{s.face}</span>{s.label}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "textarea" && (
                    <textarea className="uk-textarea" rows={4} required={q.required} maxLength={1000}
                      value={val(q)} onChange={(e) => set(q.key, e.target.value)} />
                  )}

                  {["text", "email", "number", "date"].includes(q.type) && (
                    <input className="uk-input" style={{ maxWidth: 360 }} type={q.type} required={q.required}
                      maxLength={q.type === "text" ? 200 : undefined} min={q.type === "number" ? 1 : undefined}
                      max={q.type === "number" ? 120 : undefined}
                      value={val(q)} onChange={(e) => set(q.key, e.target.value)} />
                  )}
                </div>
              );
            })}
          </section>
        ))}

        {/* Honeypot: hidden from people, bots tend to fill it */}
        <input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)}
          style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />

        {status === "error" && <p className="err">We couldn't send your answers. Please check your entries and try again.</p>}
        <button className="cta" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Submitting…" : "Submit feedback"}
        </button>
      </form>
    </main>
  );
}