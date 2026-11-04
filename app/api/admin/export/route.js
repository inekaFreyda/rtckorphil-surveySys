import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin";
import { requireAdminApi } from "../../../../lib/auth";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const HOUR = 3600 * 1000;

// Timestamp -> "2026-11-04 14:30" in Philippine time
const manila = (ts) =>
  ts?.toDate ? new Date(ts.toDate().getTime() + 8 * HOUR).toISOString().slice(0, 16).replace("T", " ") : "";

// One CSV cell: always quoted, quotes doubled, and a leading ' added to text that
// starts with = + - @ so Excel can't treat it as a formula
function cell(v, type) {
  if (v === undefined || v === null) return "";
  let s = type === "scale" && v === "NA" ? "N/A" : String(v);
  if (type !== "number" && type !== "scale" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  const from = DAY.test(sp.get("from") ?? "") ? sp.get("from") : "";
  const to = DAY.test(sp.get("to") ?? "") ? sp.get("to") : "";

  let q = db.collection("responses").orderBy("createdAt", "asc");
  if (from) q = q.where("createdAt", ">=", new Date(`${from}T00:00:00+08:00`));
  if (to) q = q.where("createdAt", "<=", new Date(`${to}T23:59:59.999+08:00`));

  const [respSnap, qSnap] = await Promise.all([q.get(), db.collection("questions").get()]);
  const responses = respSnap.docs.map((d) => d.data());
  const questions = qSnap.docs.map((d) => d.data()).sort((a, b) => a.order - b.order);

  // Columns: current questions in form order (hidden ones only if they have answers),
  // then answers whose question no longer exists
  const used = new Set(responses.flatMap((r) => Object.keys(r.answers ?? {})));
  const known = new Set(questions.map((x) => x.key));
  const columns = [
    ...questions
      .filter((x) => x.active || used.has(x.key))
      .map((x) => ({ key: x.key, type: x.type, header: x.locked ? `${x.key.toUpperCase()}. ${x.label}` : x.label })),
    ...[...used]
      .filter((k) => !known.has(k))
      .map((k) => ({
        key: k,
        type: "text",
        header: responses.find((r) => r.labels?.[k])?.labels[k] ?? k,
      })),
  ];

  const header = ["Submitted", ...columns.map((c) => cell(c.header, "text"))].join(",");
  const lines = responses.map((r) =>
    [cell(manila(r.createdAt), "scale"), ...columns.map((c) => cell(r.answers?.[c.key], c.type))].join(",")
  );

  const today = new Date(Date.now() + 8 * HOUR).toISOString().slice(0, 10);
  const name = from || to ? `csm-responses_${from || "start"}_to_${to || today}.csv` : `csm-responses_${today}.csv`;

  // BOM so Excel reads Filipino/accented characters correctly; CRLF line endings
  return new NextResponse("\uFEFF" + [header, ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}