import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebaseAdmin";
import { requireAdminApi } from "../../../../../lib/auth";
import { parseLabel, parseOptions } from "../../../../../lib/questionRules";

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

// Edit a question: label, options, required, active (hidden)
export async function PUT(req, { params }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { key } = await params;

  const ref = db.collection("questions").doc(key);
  const snap = await ref.get();
  if (!snap.exists) return bad("Question not found.", 404);
  const cur = snap.data();
  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid request.");

  // Standard (locked) questions: wording only, unless Advanced editing is on
  const structural = ["options", "required", "active"].some((k) => k in body);
  if (cur.locked && structural && body.advanced !== true)
    return bad("This is a standard question. Turn on Advanced editing to change more than its wording.", 403);

  const update = {};
  if ("label" in body) {
    const label = parseLabel(body.label);
    if (!label) return bad("Enter a question (up to 300 characters).");
    update.label = label;
  }
  if ("options" in body) {
    if (cur.type !== "radio") return bad("Only multiple-choice questions have choices.");
    const options = parseOptions(body.options);
    if (!options) return bad("Add 2 to 15 different choices, one per line.");
    // Skip rules point at choice positions, so keep those positions valid
    if (cur.rule && cur.rule.setIndex >= options.length) return bad("Too few choices for this question's skip rule.");
    update.options = options;
  }
  for (const k of ["required", "active"]) {
    if (k in body) {
      if (typeof body[k] !== "boolean") return bad("Invalid value.");
      update[k] = body[k];
    }
  }
  if (!Object.keys(update).length) return bad("Nothing to update.");

  await ref.update(update);
  return NextResponse.json({ ok: true, question: { ...cur, ...update } });
}