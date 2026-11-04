export const SCALE_LABELS = {
  "1": "Strongly Disagree", "2": "Disagree", "3": "Neither Agree nor Disagree",
  "4": "Agree", "5": "Strongly Agree", NA: "Not Applicable",
};
export const SCALE_FACES = { "1": "😠", "2": "🙁", "3": "😐", "4": "🙂", "5": "😄", NA: "—" };

export const fmtDate = (ts) =>
  ts?.toDate
    ? ts.toDate().toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })
    : "—";

export const display = (type, v) =>
  v === undefined || v === "" ? "—" : type === "scale" ? `${SCALE_FACES[v] ?? ""} ${SCALE_LABELS[v] ?? v}` : String(v);