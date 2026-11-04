import { db } from "../../../../lib/firebaseAdmin";
import { requireAdminPage } from "../../../../lib/auth";
import { SECTIONS } from "../../../../lib/defaultQuestions.mjs";
import FormEditor from "./FormEditor";

export const dynamic = "force-dynamic";

export default async function FormPage() {
  await requireAdminPage();
  const questions = (await db.collection("questions").get()).docs
    .map((d) => d.data())
    .sort((a, b) => a.order - b.order);
  return <FormEditor initial={questions} sections={SECTIONS} />;
}