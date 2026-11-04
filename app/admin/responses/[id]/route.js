import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebaseAdmin";
import { requireAdminApi } from "../../../../../lib/auth";

export async function DELETE(_req, { params }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  await db.collection("responses").doc(id).delete();
  return NextResponse.json({ ok: true });
}