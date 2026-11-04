import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin";
import { requireAdminApi } from "../../../../lib/auth";

const bad = (error) => NextResponse.json({ error }, { status: 400 });
const parseDate = (v) => (v === null ? null : typeof v === "string" && !isNaN(new Date(v)) ? new Date(v) : undefined);

// Partial update: send only the fields you want to change
export async function PUT(req) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid request.");

  const update = {};

  if ("isOpen" in body) {
    if (typeof body.isOpen !== "boolean") return bad("Invalid open/closed value.");
    update.isOpen = body.isOpen;
  }
  if ("closedMessage" in body) {
    const m = typeof body.closedMessage === "string" ? body.closedMessage.trim() : "";
    if (!m || m.length > 500) return bad("The closed message must be 1 to 500 characters.");
    update.closedMessage = m;
  }
  for (const k of ["opensAt", "closesAt"]) {
    if (k in body) {
      const d = parseDate(body[k]);
      if (d === undefined) return bad("Invalid date.");
      update[k] = d;
    }
  }
  if (update.opensAt && update.closesAt && update.closesAt <= update.opensAt)
    return bad("The close date must be after the open date.");

  if (!Object.keys(update).length) return bad("Nothing to update.");

  await db.doc("settings/form").set(update, { merge: true });
  return NextResponse.json({ ok: true });
}