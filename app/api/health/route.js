import { NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// TEMPORARY: delete this file once the site works
export async function GET() {
  const env = Object.fromEntries(
    ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "FIREBASE_WEB_API_KEY", "ADMIN_EMAILS"]
      .map((k) => [k, !!process.env[k]])
  );
  try {
    const q = await db.collection("questions").limit(1).get();
    const s = await db.doc("settings/form").get();
    return NextResponse.json({ env, questionsFound: q.size, settingsExist: s.exists });
  } catch (e) {
    return NextResponse.json({ env, error: String(e.code ?? ""), message: String(e.message).slice(0, 300) }, { status: 500 });
  }
}