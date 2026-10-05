import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findBrochure } from "@/lib/brochures";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Brosura | Reljkoviceva 59",
  robots: { index: false },
};

export default async function BrochurePage({ params }: { params: Promise<{ externalId: string }> }) {
  const { externalId } = await params;
  const brochure = await findBrochure(externalId);

  if (!brochure) {
    notFound();
  }

  if (brochure.kind === "pdf") {
    redirect(brochure.fileUrl);
  }

  return (
    <main className="brochure-page">
      <div className="brochure-bar">
        <Link className="action-link" href="/">
          Nazad na stanove
        </Link>
        <a className="action-link primary" href={brochure.fileUrl} download>
          Preuzmi brosuru
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brochure-image" src={brochure.fileUrl} alt={`Brosura ${externalId}`} />
    </main>
  );
}
