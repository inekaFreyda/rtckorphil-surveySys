import Link from "next/link";

export default function Landing() {
  return (
    <main className="shell" style={{ maxWidth: 560, paddingTop: 64 }}>
      <div className="panel center">
        {/* Put your seal at public/logo.png */}
        <img src="/korphil-logo.jpg" alt="KOICA-Philippines Vocational Training Center, RTC Davao" width={200} height={200} style={{ margin: "0 auto 16px" }} />
        <h1 style={{ fontWeight: 400, fontSize: "1.5rem", color: "var(--navy)" }}>
          TECHNICAL EDUCATION AND SKILLS DEVELOPMENT AUTHORITY (TESDA)
        </h1>
        <p style={{ fontStyle: "italic", fontWeight: 700 }}>HELP US SERVE YOU BETTER!</p>
        <h2>Client Satisfaction Measurement (CSM)</h2>
        <p className="hint">
          This CSM tracks the customer experience of government offices. Your feedback on your recently
          concluded transaction will help this office provide a better service. Personal information shared
          will be kept confidential and you always have the option to not answer this form.
        </p>
        <Link href="/survey" className="cta">Answer Survey</Link>
        <p className="hint" style={{ marginTop: 16 }}>Regional Training Center Davao · KOICA–KORPHIL</p>
      </div>
    </main>
  );
}
