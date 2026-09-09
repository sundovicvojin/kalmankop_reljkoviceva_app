"use client";

import { type CSSProperties, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { viewerViews } from "@/config/viewer";
import type { PublicApartment } from "@/lib/apartments";
import { ApartmentDetail } from "@/components/viewer/ApartmentDetail";
import { FrameSequence } from "@/components/viewer/FrameSequence";
import type { FrameSequenceHandle } from "@/components/viewer/FrameSequence";
import { SvgOverlay } from "@/components/viewer/SvgOverlay";

type Props = {
  apartments: PublicApartment[];
};

type UnitType = PublicApartment["unitType"];

const allStatuses: Array<PublicApartment["status"]> = ["AVAILABLE", "RESERVED", "SOLD"];
const allUnitTypes: UnitType[] = ["APARTMENT", "GARAGE"];

const statusOptions: Array<{ value: PublicApartment["status"]; label: string }> = [
  { value: "AVAILABLE", label: "Slobodni" },
  { value: "RESERVED", label: "Rezervisani" },
  { value: "SOLD", label: "Prodati" },
];

const unitTypeOptions: Array<{ value: UnitType; label: string }> = [
  { value: "APARTMENT", label: "Stan" },
  { value: "GARAGE", label: "Garaza" },
];

export function BuildingViewer({ apartments }: Props) {
  const [viewIndex, setViewIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState(viewerViews[0]?.image ?? "");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const animationIdRef = useRef(0);
  const frameSequenceRef = useRef<FrameSequenceHandle | null>(null);
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);
  const dragStartRef = useRef<{ x: number; y: number; pointerId: number; didRotate: boolean } | null>(null);

  const areaBounds = useMemo(() => {
    const areas = apartments.map((apartment) => Number.parseFloat(apartment.totalArea)).filter(Number.isFinite);
    const min = areas.length > 0 ? Math.floor(Math.min(...areas)) : 0;
    const max = areas.length > 0 ? Math.ceil(Math.max(...areas)) : 100;

    return { min, max };
  }, [apartments]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Array<PublicApartment["status"]>>(allStatuses);
  const [selectedTypes, setSelectedTypes] = useState<UnitType[]>(allUnitTypes);
  const [areaRange, setAreaRange] = useState(areaBounds);
  const [imageMap, setImageMap] = useState<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    setAreaRange(areaBounds);
  }, [areaBounds]);

  const filteredApartments = useMemo(
    () =>
      apartments.filter((apartment) => {
        const area = Number.parseFloat(apartment.totalArea);

        return (
          selectedStatuses.includes(apartment.status) &&
          selectedTypes.includes(apartment.unitType) &&
          Number.isFinite(area) &&
          area >= areaRange.min &&
          area <= areaRange.max
        );
      }),
    [apartments, areaRange.max, areaRange.min, selectedStatuses, selectedTypes],
  );

  const filteredApartmentsByExternalId = useMemo(
    () => new Map(filteredApartments.map((apartment) => [apartment.externalId, apartment])),
    [filteredApartments],
  );

  useEffect(() => {
    if (selectedId && !filteredApartmentsByExternalId.has(selectedId)) {
      setSelectedId(null);
    }

    if (hoveredId && !filteredApartmentsByExternalId.has(hoveredId)) {
      setHoveredId(null);
    }
  }, [filteredApartmentsByExternalId, hoveredId, selectedId]);

  const resetFilters = useCallback(() => {
    setSelectedStatuses(allStatuses);
    setSelectedTypes(allUnitTypes);
    setAreaRange(areaBounds);
    setSelectedId(null);
    setHoveredId(null);
  }, [areaBounds]);

  const toggleStatus = useCallback((status: PublicApartment["status"]) => {
    setSelectedId(null);
    setHoveredId(null);
    setSelectedStatuses((current) => toggleValue(current, status));
  }, []);

  const toggleUnitType = useCallback((unitType: UnitType) => {
    setSelectedId(null);
    setHoveredId(null);
    setSelectedTypes((current) => toggleValue(current, unitType));
  }, []);

  const activeFilterCount = useMemo(
    () =>
      (selectedStatuses.length === allStatuses.length ? 0 : 1) +
      (selectedTypes.length === allUnitTypes.length ? 0 : 1) +
      (areaRange.min === areaBounds.min && areaRange.max === areaBounds.max ? 0 : 1),
    [areaBounds.max, areaBounds.min, areaRange.max, areaRange.min, selectedStatuses.length, selectedTypes.length],
  );

  const view = viewerViews[viewIndex];
  const selectedApartment = selectedId ? filteredApartmentsByExternalId.get(selectedId) ?? null : null;
  const hoveredApartment = hoveredId ? filteredApartmentsByExternalId.get(hoveredId) ?? null : null;

  useEffect(() => {
    let alive = true;
    const urls = getAllFrameUrls();
    let loadedCount = 0;
    const loadedImageMap = new Map<string, HTMLImageElement>();

    function markLoaded(src: string, image: HTMLImageElement) {
      loadedImageMap.set(src, image);
      loadedCount += 1;

      if (alive) {
        setPreloadProgress(Math.round((loadedCount / urls.length) * 100));
      }
    }

    preloadImages(urls, markLoaded).then(() => {
      if (alive) {
        preloadedImagesRef.current = Array.from(loadedImageMap.values());
        setImageMap(loadedImageMap);
        setImageSrc(viewerViews[0]?.image ?? "");
        setIsPreloaded(true);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const changeView = useCallback(async (direction: -1 | 1) => {
    if (!isPreloaded || isAnimating) {
      return;
    }

    setSelectedId(null);
    setHoveredId(null);
    setIsAnimating(true);

    const animationId = animationIdRef.current + 1;
    animationIdRef.current = animationId;

    const currentIndex = viewIndex;
    const nextIndex = (currentIndex + direction + viewerViews.length) % viewerViews.length;
    const transitionView = direction === 1 ? viewerViews[currentIndex] : viewerViews[nextIndex];
    const frames = getTransitionFrames(transitionView, direction);

    for (const src of frames) {
      if (animationIdRef.current !== animationId) {
        return;
      }

      frameSequenceRef.current?.drawFrame(src);
      await wait(10);
    }

    if (animationIdRef.current === animationId) {
      setViewIndex(nextIndex);
      setImageSrc(viewerViews[nextIndex]?.image ?? "");
      frameSequenceRef.current?.drawFrame(viewerViews[nextIndex]?.image ?? "");
      setIsAnimating(false);
    }
  }, [isAnimating, isPreloaded, viewIndex]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isPreloaded || isAnimating || event.button !== 0) {
      return;
    }

    if (event.target instanceof Element && event.target.closest("[data-apartment-id]")) {
      return;
    }

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      didRotate: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [isAnimating, isPreloaded]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const isHorizontalSwipe = Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (isHorizontalSwipe && !start.didRotate) {
      event.preventDefault();
      start.didRotate = true;
      void changeView(deltaX < 0 ? 1 : -1);
    }
  }, [changeView]);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handlePointerCancel = useCallback((event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target;
      const isFormField = target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);

      if (isFormField || selectedId || isFilterOpen) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void changeView(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        void changeView(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeView, isFilterOpen, selectedId]);

  return (
    <div className="viewer-layout">
      <FilterPanel
        areaBounds={areaBounds}
        areaRange={areaRange}
        isOpen={isFilterOpen}
        resultCount={filteredApartments.length}
        selectedStatuses={selectedStatuses}
        selectedTypes={selectedTypes}
        totalCount={apartments.length}
        onAreaChange={setAreaRange}
        onClose={() => setIsFilterOpen(false)}
        onReset={resetFilters}
        onStatusToggle={toggleStatus}
        onTypeToggle={toggleUnitType}
      />
      <div className="viewer-stage" aria-label="Prikaz zgrade sa interaktivnim stanovima">
        {isPreloaded ? (
          <>
            <div
              className="stage-media"
              onPointerCancel={handlePointerCancel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDragStart={(event) => event.preventDefault()}
            >
              <div className="image-overlay-box">
                <FrameSequence ref={frameSequenceRef} imageMap={imageMap} view={view} src={imageSrc} />
                {isAnimating ? null : (
                  <SvgOverlay
                    key={view.id}
                    view={view}
                    apartmentsByExternalId={filteredApartmentsByExternalId}
                    activeId={selectedId}
                    onHover={(externalId, point) => {
                      setHoveredId(externalId);
                      if (point) {
                        setHoverPoint(point);
                      }
                    }}
                    onSelect={setSelectedId}
                  />
                )}
              </div>
            </div>

            <ViewNavigation viewIndex={viewIndex} total={viewerViews.length} isDisabled={isAnimating} onChange={changeView} />
            <button className="filter-toggle" type="button" onClick={() => setIsFilterOpen(true)} aria-label="Otvori filtere">
              <SlidersHorizontal size={20} aria-hidden />
              {activeFilterCount > 0 ? <span>{activeFilterCount}</span> : null}
            </button>
          </>
        ) : (
          <ViewerPreloader progress={preloadProgress} />
        )}
      </div>

      {hoveredApartment ? (
        <div className="floating-card" style={{ left: hoverPoint.x + 18, top: hoverPoint.y + 18 }}>
          <strong>STAN {hoveredApartment.number}</strong>
          <span>{hoveredApartment.totalArea} m2</span>
          <span>{hoveredApartment.floor}</span>
          <span>{statusLabel(hoveredApartment.status)}</span>
        </div>
      ) : null}

      {selectedApartment ? <ApartmentDetail apartment={selectedApartment} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

function ViewerPreloader({ progress }: { progress: number }) {
  return (
    <div className="viewer-preloader" role="status" aria-live="polite" aria-label={`Ucitavanje rendera ${progress}%`}>
      <img className="preloader-logo" src="/brand/kalman-logo-placeholder.svg" alt="" />
      <div className="preloader-copy">
        <span>KALMAN KOP</span>
        <strong>{progress}%</strong>
      </div>
      <div className="preloader-track" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function FilterPanel({
  areaBounds,
  areaRange,
  isOpen,
  resultCount,
  selectedStatuses,
  selectedTypes,
  totalCount,
  onAreaChange,
  onClose,
  onReset,
  onStatusToggle,
  onTypeToggle,
}: {
  areaBounds: { min: number; max: number };
  areaRange: { min: number; max: number };
  isOpen: boolean;
  resultCount: number;
  selectedStatuses: Array<PublicApartment["status"]>;
  selectedTypes: UnitType[];
  totalCount: number;
  onAreaChange: (range: { min: number; max: number }) => void;
  onClose: () => void;
  onReset: () => void;
  onStatusToggle: (status: PublicApartment["status"]) => void;
  onTypeToggle: (type: UnitType) => void;
}) {
  const minDistance = 1;

  function changeMin(value: string) {
    const nextMin = Math.min(Number(value), areaRange.max - minDistance);
    onAreaChange({ min: nextMin, max: areaRange.max });
  }

  function changeMax(value: string) {
    const nextMax = Math.max(Number(value), areaRange.min + minDistance);
    onAreaChange({ min: areaRange.min, max: nextMax });
  }

  const rangeSize = Math.max(areaBounds.max - areaBounds.min, 1);
  const rangeStyle = {
    "--range-start": `${((areaRange.min - areaBounds.min) / rangeSize) * 100}%`,
    "--range-end": `${((areaRange.max - areaBounds.min) / rangeSize) * 100}%`,
  } as CSSProperties;

  return (
    <>
      <button className={`filter-backdrop ${isOpen ? "is-open" : ""}`} type="button" aria-label="Zatvori filtere" onClick={onClose} />
      <aside className={`filter-panel ${isOpen ? "is-open" : ""}`} aria-label="Filteri stanova">
        <div className="filter-head">
          <div>
            <p className="panel-kicker">Filteri</p>
            <h2 className="filter-title">
              {resultCount} / {totalCount}
            </h2>
          </div>
          <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Zatvori filtere">
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="filter-group">
          <span>Status</span>
          <div className="filter-options">
            {statusOptions.map((option) => (
              <label key={option.value} className="filter-chip">
                <input type="checkbox" checked={selectedStatuses.includes(option.value)} onChange={() => onStatusToggle(option.value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span>Tip</span>
          <div className="filter-options two">
            {unitTypeOptions.map((option) => (
              <label key={option.value} className="filter-chip">
                <input type="checkbox" checked={selectedTypes.includes(option.value)} onChange={() => onTypeToggle(option.value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span>Kvadratura</span>
          <div className="range-values">
            <strong>{areaRange.min} m2</strong>
            <strong>{areaRange.max} m2</strong>
          </div>
          <div className="dual-range" style={rangeStyle}>
            <input type="range" min={areaBounds.min} max={areaBounds.max} value={areaRange.min} onChange={(event) => changeMin(event.target.value)} />
            <input type="range" min={areaBounds.min} max={areaBounds.max} value={areaRange.max} onChange={(event) => changeMax(event.target.value)} />
          </div>
        </div>

        <button className="filter-reset" type="button" onClick={onReset}>
          Resetuj filtere
        </button>
      </aside>
    </>
  );
}

function ViewNavigation({
  viewIndex,
  total,
  isDisabled,
  onChange,
}: {
  viewIndex: number;
  total: number;
  isDisabled: boolean;
  onChange: (direction: -1 | 1) => void;
}) {
  return (
    <div className="view-nav" aria-label="Promena pogleda zgrade">
      <button className="icon-button" type="button" onClick={() => onChange(-1)} aria-label="Prethodni pogled" disabled={isDisabled}>
        <ChevronLeft size={21} aria-hidden />
      </button>
      <span className="view-count" aria-live="polite">
        {String(viewIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <button className="icon-button" type="button" onClick={() => onChange(1)} aria-label="Sledeci pogled" disabled={isDisabled}>
        <ChevronRight size={21} aria-hidden />
      </button>
    </div>
  );
}

function getTransitionFrames(view: (typeof viewerViews)[number], direction: -1 | 1) {
  if (!view.frameBasePath || view.frameCount <= 0) {
    return [];
  }

  const frames = Array.from({ length: view.frameCount }, (_, index) => index + 1);
  const orderedFrames = direction === 1 ? frames : frames.reverse();

  return orderedFrames.map((frame) => `${view.frameBasePath}/${view.id}_${String(frame).padStart(3, "0")}.webp`);
}

function getAllFrameUrls() {
  return viewerViews.flatMap((view) => [view.image, ...getTransitionFrames(view, 1)]);
}

async function preloadImages(urls: string[], onLoaded: (src: string, image: HTMLImageElement) => void) {
  const queue = [...urls];
  const workers = Array.from({ length: 12 }, async () => {
    while (queue.length > 0) {
      const src = queue.shift();

      if (src) {
        const image = await loadImage(src);
        onLoaded(src, image);
      }
    }
  });

  await Promise.all(workers);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const decoded = image.decode ? image.decode() : Promise.resolve();
      decoded.catch(() => undefined).then(() => resolve(image));
    };
    image.onerror = () => resolve(image);
    image.src = src;
  });
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function statusLabel(status: PublicApartment["status"]) {
  const labels: Record<PublicApartment["status"], string> = {
    AVAILABLE: "Slobodan",
    RESERVED: "Rezervisan",
    SOLD: "Prodat",
  };

  return labels[status];
}
