import Link from "next/link";
import { requireAdminPage } from "../../../lib/auth";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "CSM Admin", robots: { index: false, follow: false } };

// Every page inside the (panel) folder is protected by this check.
// Layouts don't re-run on every in-app navigation, so each page also calls requireAdminPage().
export default async function PanelLayout({ children }) {
  const admin = await requireAdminPage();
  return (
    <div>
      <header style={{ background: "#fff", borderBottom: "1px solid #e3e5f0" }}>
        <div className="shell" style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <b style={{ color: "var(--navy)" }}>CSM Admin</b>
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/responses">Responses</Link>
            <Link href="/admin/form">Form editor</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="hint" style={{ margin: 0 }}>{admin.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="shell">{children}</main>
    </div>
  );
}