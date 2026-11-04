import Link from "next/link";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../../lib/firebaseAdmin";
import { requireAdminPage } from "../../../../lib/auth";
import { fmtDate, display } from "../../../../lib/format";

export const dynamic = "force-dynamic";
const PAGE = 20;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export default async function Responses({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const from = DAY.test(sp.from ?? "") ? sp.from : "";
  const to = DAY.test(sp.to ?? "") ? sp.to : "";
  const after = /^\d+$/.test(sp.after ?? "") ? sp.after : "";

  // Date filter uses Philippine time
  let list = db.collection("responses").orderBy("createdAt", "desc");
  let all = db.collection("responses");
  if (from) {
    const d = new Date(`${from}T00:00:00+08:00`);
    list = list.where("createdAt", ">=", d);
    all = all.where("createdAt", ">=", d);
  }
  if (to) {
    const d = new Date(`${to}T23:59:59.999+08:00`);
    list = list.where("createdAt", "<=", d);
    all = all.where("createdAt", "<=", d);
  }
  const total = (await all.count().get()).data().count;
  if (after) list = list.startAfter(Timestamp.fromMillis(Number(after)));

  const docs = (await list.limit(PAGE + 1).get()).docs;
  const rows = docs.slice(0, PAGE);
  const hasMore = docs.length > PAGE;
  const olderAfter = rows.length ? rows[rows.length - 1].data().createdAt.toMillis() : "";

  const exportQs = from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : "";

  const href = (extra) => {
    const p = new URLSearchParams({ ...(from && { from }), ...(to && { to }), ...extra });
    return `/admin/responses${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="panel">
      <h2>Responses</h2>
      <p className="hint">{total} {total === 1 ? "response" : "responses"}{from || to ? " in this date range" : ""}.</p>

      <form method="GET" style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
        <div><label className="uk-form-label">From</label><input type="date" name="from" className="uk-input" defaultValue={from} /></div>
        <div><label className="uk-form-label">To</label><input type="date" name="to" className="uk-input" defaultValue={to} /></div>
        <button className="uk-btn uk-btn-primary" type="submit">Filter</button>
        {(from || to) && <Link href="/admin/responses" className="uk-btn uk-btn-default">Clear</Link>}
      </form>

      <p style={{ marginBottom: 16 }}>
        <a className="uk-btn uk-btn-default" href={`/api/admin/export${exportQs}`}>
          Download CSV{from || to ? " (this date range)" : " (all responses)"}
        </a>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="uk-table uk-table-divider uk-table-hover uk-table-sm" style={{ minWidth: 640 }}>
          <thead>
            <tr><th>Submitted</th><th>Name</th><th>Client type</th><th>Service availed</th><th>SQD0</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5}>No responses found.</td></tr>}
            {rows.map((d) => {
              const r = d.data();
              const a = r.answers ?? {};
              return (
                <tr key={d.id}>
                  <td><Link href={`/admin/responses/${d.id}`}><b>{fmtDate(r.createdAt)}</b></Link></td>
                  <td>{a.name || "—"}</td>
                  <td>{a.clientType || "—"}</td>
                  <td>{a.service || "—"}</td>
                  <td>{display("scale", a.sqd0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        {after ? <Link href={href({})}>← Back to newest</Link> : <span />}
        {hasMore ? <Link href={href({ after: olderAfter })}>Older →</Link> : <span />}
      </div>
    </div>
  );
}