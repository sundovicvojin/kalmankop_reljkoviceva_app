import Link from "next/link";
import { BuildingViewer } from "@/components/viewer/BuildingViewer";
import { getApartments } from "@/lib/apartments";
import { getContactUrl } from "@/lib/contact-url";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const apartments = await getApartments();

    return (
      <main className="app-shell app-shell--ready">
        <Header />
        <section className="viewer-page" aria-label="Interaktivni birac stanova">
          <BuildingViewer apartments={apartments} />
        </section>
      </main>
    );
  } catch {
    return (
      <main className="app-shell app-shell--ready">
        <Header />
        <section className="viewer-page">
          <div className="viewer-stage">
            <div className="error-state">
              <div>
                <p className="eyebrow">Reljkoviceva 59</p>
                <h1 className="viewer-title">Baza trenutno nije dostupna</h1>
                <p className="viewer-subtitle">Proverite `DATABASE_URL`, migracije i seed podatke, pa osvezite stranicu.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

function Header() {
  const contactUrl = getContactUrl();

  return (
    <header className="site-header">
      <Link className="brand-lockup" href="/" aria-label="KALMAN KOP Reljkoviceva 59">
        <img className="brand-mark" src="/brand/kalman-logo-placeholder.svg" alt="" />
        <span className="brand-copy">
          <span className="brand-name">KALMAN KOP</span>
          <span className="project-name">Reljkoviceva 59</span>
        </span>
      </Link>
      <a className="header-link" href={contactUrl} target="_blank" rel="noreferrer">
        Kontakt
      </a>
    </header>
  );
}
