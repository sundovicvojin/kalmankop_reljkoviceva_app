"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, MessageCircle, X } from "lucide-react";
import type { PublicApartment } from "@/lib/apartments";
import { statusLabels } from "@/lib/status";

type Props = {
  apartment: PublicApartment;
  onClose: () => void;
};

export function ApartmentDetail({ apartment, onClose }: Props) {
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <Panel apartment={apartment} onClose={onClose} variant="desktop" />
      <Panel apartment={apartment} onClose={onClose} variant="mobile" />
    </>
  );
}

function Panel({ apartment, onClose, variant }: Props & { variant: "desktop" | "mobile" }) {
  const floorplanUrls = getFloorplanUrls(apartment);
  const [floorplanIndex, setFloorplanIndex] = useState(0);
  const floorplanUrl = floorplanUrls[floorplanIndex] ?? null;

  useEffect(() => {
    setFloorplanIndex(0);
  }, [apartment.externalId, apartment.floorplanUrl]);

  return (
    <aside className={`detail-panel ${variant}`} aria-modal="true" role="dialog" aria-labelledby={`${variant}-apartment-title`}>
      {variant === "mobile" ? <div className="sheet-handle" aria-hidden /> : null}
      <div className="panel-scroll">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Stan</p>
            <h2 className="panel-title" id={`${variant}-apartment-title`}>
              {apartment.number}
            </h2>
          </div>
          <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Zatvori detalje stana">
            <X size={20} aria-hidden />
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <span className={`status-pill status-${apartment.status}`}>{statusLabels[apartment.status]}</span>
        </div>

        <div className="metrics">
          <Metric label="Sprat" value={apartment.floor} />
          <Metric label="Kvadratura" value={`${apartment.totalArea} m2`} />
          <Metric label="Cena" value={formatPrice(apartment)} />
          <Metric label="Sobnost" value={apartment.roomCount ? `${apartment.roomCount}` : apartment.structure} />
          <Metric label="Tip" value={apartment.unitType === "GARAGE" ? "Garaza" : "Stan"} />
          <Metric label="Oznaka" value={apartment.externalId} />
        </div>

        {floorplanUrl ? (
          <a className="floorplan" href={floorplanUrl} target="_blank" rel="noreferrer" aria-label={`Otvori tlocrt za stan ${apartment.number}`}>
            <img src={floorplanUrl} alt={`Tlocrt stana ${apartment.number}`} onError={() => setFloorplanIndex((current) => current + 1)} />
          </a>
        ) : null}

        <div className="panel-actions">
          {apartment.interiorUrl ? (
            <a className="action-link" href={apartment.interiorUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} aria-hidden />
              Pogledaj stan iznutra
            </a>
          ) : null}
          {apartment.brochureUrl ? (
            <a className="action-link" href={apartment.brochureUrl} target="_blank" rel="noreferrer">
              <Download size={18} aria-hidden />
              Preuzmi brosuru
            </a>
          ) : null}
          <a className="action-link primary" href={process.env.NEXT_PUBLIC_CONTACT_URL ?? "https://kalmankop.rs/kontakt"}>
            <MessageCircle size={18} aria-hidden />
            Kontaktiraj KALMAN KOP
          </a>
        </div>
      </div>
    </aside>
  );
}

function getFloorplanUrls(apartment: PublicApartment) {
  const basePath = `/floorplans/${apartment.externalId}`;
  const urls = [`${basePath}.webp`, `${basePath}.png`];

  if (apartment.floorplanUrl && !urls.includes(apartment.floorplanUrl)) {
    urls.push(apartment.floorplanUrl);
  }

  return urls;
}

function formatPrice(apartment: PublicApartment) {
  if (!apartment.price) {
    return "Na upit";
  }

  return `${Number(apartment.price).toLocaleString("sr-RS")} ${apartment.currency}`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
