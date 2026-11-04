import { requireAdminPage } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdminPage();
  return (
    <div className="panel">
      <h2>Dashboard</h2>
      <p className="hint">You're signed in. Counts and the open/close switch come in the next step.</p>
    </div>
  );
}