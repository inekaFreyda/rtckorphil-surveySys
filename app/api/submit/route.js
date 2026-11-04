import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../../lib/firebaseAdmin";
import { getSettings, getQuestions, isFormOpen } from "../../../lib/questions";

const SCALE_VALUES = ["1", "2", "3", "4", "5", "NA"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  // Bots filled the hidden field: pretend success, save nothing
  if (body.website) return NextResponse.json({ ok: true });

  if (!isFormOpen(await getSettings()))
    return NextResponse.json({ ok: false, error: "closed" }, { status: 403 });

  const questions = await getQuestions();
  const input = body.answers ?? {};
  const answers = {};
  const labels = {};

  for (const q of questions) {
    let v = input[q.key];

    // Apply auto-answer rules on the server too (never trust the browser)
    if (q.rule) {
      const dep = questions.find((x) => x.key === q.rule.dependsOn);
      if (dep && input[dep.key] === dep.options[q.rule.whenIndex]) v = q.options[q.rule.setIndex];
    }

    v = typeof v === "string" ? v.trim() : v;
    if (v === undefined || v === null || v === "") {
      if (q.required) return NextResponse.json({ ok: false, error: `Missing: ${q.label}` }, { status: 400 });
      continue;
    }

    let valid = true;
    if (q.type === "radio") valid = q.options.includes(v);
    else if (q.type === "scale") valid = SCALE_VALUES.includes(v);
    else if (q.type === "number") { v = Number(v); valid = Number.isFinite(v) && v >= 1 && v <= 120; }
    else if (q.type === "email") valid = typeof v === "string" && v.length <= 200 && EMAIL.test(v);
    else if (q.type === "date") valid = /^\d{4}-\d{2}-\d{2}$/.test(v);
    else valid = typeof v === "string" && v.length <= 1000;

    if (!valid) return NextResponse.json({ ok: false, error: `Invalid: ${q.label}` }, { status: 400 });

    answers[q.key] = v;
    labels[q.key] = q.label; // snapshot so exports stay readable after the form is edited
  }

  await db.collection("responses").add({ createdAt: FieldValue.serverTimestamp(), answers, labels });
  return NextResponse.json({ ok: true });
}