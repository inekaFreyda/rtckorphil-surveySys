import { NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebaseAdmin";
import { COOKIE, SESSION_MS, isAllowedEmail } from "../../../../lib/auth";

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  // Same message for every failure so the form doesn't reveal which emails exist
  const fail = () => NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  if (!email || !password || !isAllowedEmail(email)) return fail();

  // Check the password with Firebase Authentication
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (!r.ok) return fail();
  const { idToken } = await r.json();

  const session = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MS });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
  return res;
}