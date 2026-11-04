import { db } from "../../../lib/firebaseAdmin";
import { requireAdminPage } from "../../../lib/auth";
import { getSettings, isFormOpen } from "../../../lib/questions";
import FormStatus from "./FormStatus";

export const dynamic = "force-dynamic";

const iso = (v) => {
  const d = v?.toDate ? v.toDate() : v ? new Date(v) : null;
  return d ? d.toISOString() : null;
};

// Start of "today" in Philippine time (UTC+8), since the server may run in UTC
function manilaDayStart() {
  const off = 8 * 3600 * 1000;
  const shifted = Date.now() + off;
  return new Date(shifted - (shifted % 86400000) - off);
}

const count = async (q) => (await q.count().get()).data().count;

export default async function Dashboard() {
  await requireAdminPage();

  const settings = await getSettings();
  const col = db.collection("responses");
  const [total, today, rated, satisfied] = await Promise.all([
    count(col),
    count(col.where("createdAt", ">=", manilaDayStart())),
    count(col.where("answers.sqd0", "in", ["1", "2", "3", "4", "5"])),
    count(col.where("answers.sqd0", "in", ["4", "5"])),
  ]);
  const rate = rated ? Math.round((satisfied / rated) * 1000) / 10 : null;

  const stats = [
    ["Total responses", total],
    ["Today", today],
    ["Satisfied (SQD0)", rate === null ? "—" : `${rate}%`],
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        {stats.map(([label, value]) => (
          <div className="panel" key={label} style={{ marginBottom: 0 }}>
            <p className="hint" style={{ margin: 0 }}>{label}</p>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--navy)" }}>{value}</div>
          </div>
        ))}
      </div>
      <p className="hint" style={{ marginTop: -4 }}>
        Satisfied = share of “Agree” or “Strongly Agree” answers to SQD0, not counting N/A.
      </p>

      <FormStatus
        accepting={isFormOpen(settings)}
        initial={{
          isOpen: !!settings.isOpen,
          closedMessage: settings.closedMessage || "",
          opensAt: iso(settings.opensAt),
          closesAt: iso(settings.closesAt),
        }}
      />
    </>
  );
}