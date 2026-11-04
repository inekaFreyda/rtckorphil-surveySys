import { db } from "./firebaseAdmin";

export async function getSettings() {
  const snap = await db.doc("settings/form").get();
  return snap.exists ? snap.data() : { isOpen: false, closedMessage: "This survey is currently closed." };
}

// Active questions in display order (filtered in JS to avoid needing a Firestore composite index)
export async function getQuestions() {
  const snap = await db.collection("questions").get();
  return snap.docs.map((d) => d.data()).filter((q) => q.active).sort((a, b) => a.order - b.order);
}

const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);

export function isFormOpen(s) {
  const now = new Date();
  const opens = toDate(s.opensAt);
  const closes = toDate(s.closesAt);
  return !!s.isOpen && (!opens || now >= opens) && (!closes || now <= closes);
}