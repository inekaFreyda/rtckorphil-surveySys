import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "../../../../lib/firebaseAdmin";
import { requireAdminApi } from "../../../../lib/auth";
import { TYPES, SECTION_KEYS, parseLabel, parseOptions } from "../../../../lib/questionRules";

const bad = (error) => NextResponse.json({ error }, { status: 400 });

// Add a new question (always unlocked, placed at the end of its section)
export async function POST(req) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid request.");

  const label = parseLabel(body.label);
  if (!label) return bad("Enter a question (up to 300 characters).");
  if (!TYPES.includes(body.type)) return bad("Choose a question type.");
  if (!SECTION_KEYS.includes(body.section)) return bad("Choose a section.");

  let options = [];
  if (body.type === "radio") {
    options = parseOptions(body.options);
    if (!options) return bad("Add 2 to 15 different choices, one per line.");
  }

  const all = (await db.collection("questions").get()).docs.map((d) => d.data());
  const order = Math.max(0, ...all.map((q) => q.order || 0)) + 10;
  const key = `q_${randomBytes(4).toString("hex")}`;

  const question = {
    key, section: body.section, type: body.type, label, options,
    required: body.required !== false, active: true, locked: false, rule: null, order,
  };
  await db.collection("questions").doc(key).set(question);
  return NextResponse.json({ ok: true, question });
}