import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { adminAuth } from "./firebaseAdmin";

export const COOKIE = "csm_admin";
export const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // stay logged in for 7 days

const allowed = () =>
  (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

export const isAllowedEmail = (email) => allowed().includes(String(email || "").toLowerCase());

// Returns the logged-in admin, or null
export async function getAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(value, true); // true = also check it wasn't revoked
    return isAllowedEmail(decoded.email) ? decoded : null;
  } catch {
    return null;
  }
}

// For pages: redirects to the login page when not logged in
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// For API routes: returns a 401 response when not logged in, otherwise null
//   const denied = await requireAdminApi(); if (denied) return denied;
export async function requireAdminApi() {
  return (await getAdmin()) ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}