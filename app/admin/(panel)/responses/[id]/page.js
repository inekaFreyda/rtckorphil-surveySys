import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../../../../lib/firebaseAdmin";
import { requireAdminPage } from "../../../../../lib/auth";
import { fmtDate, display } from "../../../../../lib/format";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function ResponseDetail({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const snap = await db.collection("responses").doc(id).get();
  if (!snap.exists) notFound();
  const r = snap.data();
  const answers = r.answers ?? {};
  const labels = r.labels ?? {};

  // Show answers in the form's current order, then any leftover keys from removed questions
  const questions = (await db.collection("questions").get()).docs.map((d) => d.data()).sort((a, b) => a.order - b.order);
  const types = Object.fromEntries(questions.map((q) => [q.key, q.type]));
  const keys = [
    ...questions.map((q) => q.key).filter((k) => k in answers),
    ...Object.keys(answers).filter((k) => !(k in types)),
  ];

  return (
    <div className="panel">
      <Link href="/admin/responses">← All responses</Link>
      <h2 style={{ marginTop: 12 }}>Response</h2>
      <p className="hint">Submitted {fmtDate(r.createdAt)}</p>

      {keys.map((k) => (
        <div className="q" key={k}>
          <p className="hint" style={{ margin: 0 }}>{labels[k] ?? k}</p>
          <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{display(types[k], answers[k])}</p>
        </div>
      ))}

      <div style={{ marginTop: 20 }}><DeleteButton id={id} /></div>
    </div>
  );
}