// Shared validation for question edits (used by the create and update routes)
export const TYPES = ["radio", "text", "textarea", "number", "date", "email", "scale"];
export const SECTION_KEYS = ["about", "charter", "service"];

export function parseLabel(v) {
  const s = typeof v === "string" ? v.trim() : "";
  return s && s.length <= 300 ? s : null;
}

// 2 to 15 unique, non-empty choices
export function parseOptions(v) {
  if (!Array.isArray(v)) return null;
  const list = v.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean);
  if (list.length < 2 || list.length > 15 || list.some((o) => o.length > 150)) return null;
  return new Set(list).size === list.length ? list : null;
}