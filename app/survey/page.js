import { getSettings, getQuestions, isFormOpen } from "../../lib/questions";
import { SECTIONS } from "../../lib/defaultQuestions.mjs";
import SurveyForm from "./SurveyForm";

export const dynamic = "force-dynamic"; // always read the latest form + open/closed status

export default async function SurveyPage() {
  const settings = await getSettings();
  if (!isFormOpen(settings)) {
    return (
      <main className="shell">
        <div className="panel center">
          <h2>Survey closed</h2>
          <p className="hint">{settings.closedMessage}</p>
        </div>
      </main>
    );
  }
  const questions = await getQuestions();
  return <SurveyForm questions={questions} sections={SECTIONS} />;
}