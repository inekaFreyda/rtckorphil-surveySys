// Usage: npm run seed            (first-time setup, refuses if questions already exist)
//        npm run seed -- --force (overwrites questions with the defaults)
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defaultQuestions, defaultSettings } from "../lib/defaultQuestions.mjs";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app);

const existing = await db.collection("questions").limit(1).get();
if (!existing.empty && !process.argv.includes("--force")) {
  console.log("Questions already exist. Re-run with --force to overwrite them.");
  process.exit(0);
}

const batch = db.batch();
for (const item of defaultQuestions) batch.set(db.collection("questions").doc(item.key), item);
if (!(await db.doc("settings/form").get()).exists) batch.set(db.doc("settings/form"), defaultSettings);
await batch.commit();

console.log(`Seeded ${defaultQuestions.length} questions.`);
