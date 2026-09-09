"use client";

import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import type { ViewerView } from "@/config/viewer";
import type { PublicApartment } from "@/lib/apartments";

type Props = {
  view: ViewerView;
  apartmentsByExternalId: Map<string, PublicApartment>;
  activeId: string | null;
  onHover: (externalId: string | null, point?: { x: number; y: number }) => void;
  onSelect: (externalId: string) => void;
};

export function SvgOverlay({ view, apartmentsByExternalId, activeId, onHover, onSelect }: Props) {
  const [svg, setSvg] = useState<string>("");
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    setSvg("");

    fetch(view.overlay)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Overlay nije dostupan.");
        }
        return response.text();
      })
      .then((text) => {
        if (alive) {
          setSvg(text);
        }
      })
      .catch(() => {
        if (alive) {
          setSvg("");
        }
      });

    return () => {
      alive = false;
    };
  }, [view.overlay]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) {
      return;
    }

    const nodes = layer.querySelectorAll<SVGElement>("[data-apartment-id], [id^='APT_']");
    nodes.forEach((node) => {
      const id = apartmentIdFromNode(node);
      const apartment = id ? apartmentsByExternalId.get(id) : null;
      if (id) {
        node.setAttribute("data-apartment-id", id);
      }
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", apartment ? `Stan ${apartment.number}, ${apartment.totalArea} m2, ${statusLabel(apartment.status)}` : "Stan");
      node.setAttribute("data-status", apartment?.status ?? "AVAILABLE");
      node.classList.toggle("is-active", id === activeId);
    });
  }, [activeId, apartmentsByExternalId, svg]);

  function apartmentIdFromEvent(target: EventTarget | null) {
    if (!(target instanceof Element)) {
      return null;
    }

    const node = target.closest("[data-apartment-id]");
    if (!(node instanceof SVGElement)) {
      return null;
    }

    const externalId = apartmentIdFromNode(node);
    return externalId && apartmentsByExternalId.has(externalId) ? externalId : null;
  }

  function handleClick(event: MouseEvent<HTMLDivElement | SVGSVGElement>) {
    const externalId = apartmentIdFromEvent(event.target);
    if (externalId) {
      onSelect(externalId);
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement | SVGSVGElement>) {
    const externalId = apartmentIdFromEvent(event.target);
    onHover(externalId, externalId ? { x: event.clientX, y: event.clientY } : undefined);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement | SVGSVGElement>) {
    const externalId = apartmentIdFromEvent(event.target);
    if (externalId && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onSelect(externalId);
    }
  }

  if (!svg) {
    return null;
  }

  return (
    <div
      ref={layerRef}
      className="svg-layer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover(null)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function apartmentIdFromNode(node: SVGElement) {
  return node.dataset.apartmentId || node.id || null;
}

function statusLabel(status: PublicApartment["status"]) {
  const labels: Record<PublicApartment["status"], string> = {
    AVAILABLE: "slobodan",
    RESERVED: "rezervisan",
    SOLD: "prodat",
  };

  return labels[status];
}
