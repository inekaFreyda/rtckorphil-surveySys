// Starting questions for the CSM form. The seed script loads these into Firestore.
// type: radio | text | number | date | email | textarea | scale
// locked: true = standard CSM question (reword only, unless Advanced editing is on)
// rule: auto-answers this question when another question has a given option selected (by option position, starting at 0)

export const SECTIONS = {
  about: "About you",
  charter: "Citizen's Charter",
  service: "Service quality",
};

const CC1 = [
  "I know what a CC is and I saw this office's CC.",
  "I know what a CC is but I did NOT see this office's CC.",
  "I learned of the CC only when I saw this office's CC.",
  "I do not know what a CC is and I did not see one in this office. (Answer N/A on CC2 and CC3)",
];
const CC2 = ["Easy to see", "Somewhat easy to see", "Difficult to see", "Not visible at all", "N/A"];
const CC3 = ["Helped very much", "Somewhat helped", "Did not help", "N/A"];

const SQD = [
  "I am satisfied with the service that I availed.",
  "I spent a reasonable amount of time for my transaction.",
  "The office followed the transaction's requirements and steps based on the information provided.",
  "The steps (including payment) I needed to do for my transaction were easy and simple.",
  "I easily found information about my transaction from the office or its website.",
  "I paid a reasonable amount of fees for my transaction. (If service was free, mark N/A)",
  "I feel the office was fair to everyone, or “walang palakasan”, during my transaction.",
  "I was treated courteously by the staff, and (if asked for help) the staff was helpful.",
  "I got what I needed from the government office, or (if denied) denial of request was sufficiently explained to me.",
];

const q = (key, section, type, label, extra = {}) => ({
  key, section, type, label,
  options: [], required: true, active: true, locked: false, rule: null,
  ...extra,
});

export const defaultQuestions = [
  q("clientType", "about", "radio", "Client type", { options: ["Citizen", "Business", "Government (Employee or another agency)"] }),
  q("date", "about", "date", "Date"),
  q("name", "about", "text", "Name (optional)", { required: false }),
  q("age", "about", "number", "Age"),
  q("sex", "about", "radio", "Sex", { options: ["Male", "Female"] }),
  q("employment", "about", "radio", "Employment status", { options: ["Employed", "Unemployed", "Student"] }),
  q("education", "about", "radio", "Educational background", {
    options: ["Post Graduate", "College Graduate", "College Undergraduate", "High School Graduate (K-12)", "High School Undergraduate", "Elementary Graduate"],
  }),
  q("region", "about", "text", "Region of residence"),
  q("service", "about", "text", "Citizen's Charter service availed"),
  q("transaction", "about", "radio", "Type of transaction", {
    options: ["Assessment and Certification", "Program Registration", "Training", "Scholarship", "Administrative", "Others"],
  }),

  q("cc1", "charter", "radio", "Which of the following best describes your awareness of a CC?", { options: CC1, locked: true }),
  q("cc2", "charter", "radio", "If aware of CC (answered 1-3 in CC1), would you say that the CC of this office was…?", {
    options: CC2, locked: true, rule: { dependsOn: "cc1", whenIndex: 3, setIndex: 4 },
  }),
  q("cc3", "charter", "radio", "If aware of CC (answered 1-3 in CC1), how much did the CC help you in your transaction?", {
    options: CC3, locked: true, rule: { dependsOn: "cc1", whenIndex: 3, setIndex: 3 },
  }),

  ...SQD.map((label, i) => q(`sqd${i}`, "service", "scale", label, { locked: true })),
].map((item, i) => ({ ...item, order: (i + 1) * 10 }));

export const defaultSettings = {
  isOpen: true,
  closedMessage: "This survey is currently closed. Thank you for your interest.",
  opensAt: null,
  closesAt: null,
};
