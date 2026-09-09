"use client";

import { useEffect } from "react";
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
      <button className="detail-backdrop" type="button" aria-label="Zatvori detalje stana" onClick={onClose} />
      <Panel apartment={apartment} onClose={onClose} variant="desktop" />
      <Panel apartment={apartment} onClose={onClose} variant="mobile" />
    </>
  );
}

function Panel({ apartment, onClose, variant }: Props & { variant: "desktop" | "mobile" }) {
  const floorplanUrl = `/floorplans/${apartment.externalId}.webp`;
  const brochureUrl = `/brochures/${apartment.externalId}.pdf`;

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

        <div className="panel-status">
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
            <img src={floorplanUrl} alt={`Tlocrt stana ${apartment.number}`} />
          </a>
        ) : null}

        <div className="panel-actions">
          {apartment.interiorUrl ? (
            <a className="action-link" href={apartment.interiorUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} aria-hidden />
              Pogledaj stan iznutra
            </a>
          ) : null}
          <a className="action-link" href={brochureUrl} target="_blank" rel="noreferrer">
            <Download size={18} aria-hidden />
            Preuzmi brosuru
          </a>
          <a className="action-link primary" href="https://kalmankop.rs/kontakt-kalman-kop-novi-sad/">
            <MessageCircle size={18} aria-hidden />
            Kontaktiraj KALMAN KOP
          </a>
        </div>
      </div>
    </aside>
  );
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
