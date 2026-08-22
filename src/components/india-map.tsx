import { useEffect, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import type { CityRanking } from "@/lib/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const INDIA_CENTER: [number, number] = [80.2, 22.6];

export type IndiaMapProps = {
  cities: CityRanking[];
  focusSlug?: string | null;
  onSelectCity?: (slug: string) => void;
  className?: string;
};

type MarkerHandle = { remove: () => void };

function markerElement(city: CityRanking, isFocused: boolean, dimmed: boolean) {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", `${city.name ?? "City"}${city.rank ? ` rank ${city.rank}` : ""}`);
  const rank = city.rank;
  const tier = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "plain";
  el.className = [
    "bi-marker",
    `bi-marker--${tier}`,
    isFocused ? "bi-marker--focused" : "",
    dimmed ? "bi-marker--dim" : "",
  ]
    .filter(Boolean)
    .join(" ");
  el.innerHTML = `
    <span class="bi-marker__rank">${rank != null ? String(rank).padStart(2, "0") : "•"}</span>
    <span class="bi-marker__name">${city.name ?? ""}</span>
    ${rank == null ? '<span class="bi-marker__meta">Unranked</span>' : ""}
  `;
  return el;
}

export function IndiaMap({ cities, focusSlug, onSelectCity, className }: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  const selectRef = useRef(onSelectCity);
  selectRef.current = onSelectCity;

  useEffect(() => {
    let cancelled = false;
    let map: maplibregl.Map | null = null;

    void (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      map = new maplibre.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: INDIA_CENTER,
        zoom: 3.7,
        minZoom: 3,
        maxZoom: 14,
        attributionControl: { compact: true },
        dragRotate: false,
      });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-right");
      map.scrollZoom.disable();
      mapRef.current = map;

      map.on("load", async () => {
        if (!map) return;
        try {
          const response = await fetch("/data/india-states.geojson");
          const geojson = await response.json();
          if (!map || cancelled) return;
          map.addSource("india-states", { type: "geojson", data: geojson });
          map.addLayer({
            id: "india-states-fill",
            type: "fill",
            source: "india-states",
            paint: { "fill-color": "#f2a341", "fill-opacity": 0.05 },
          });
          map.addLayer({
            id: "india-states-line",
            type: "line",
            source: "india-states",
            paint: { "line-color": "#f2a341", "line-opacity": 0.35, "line-width": 0.8 },
          });
        } catch {
          /* boundaries are decorative */
        }
      });
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const maplibre = await import("maplibre-gl");
      const map = mapRef.current;
      if (!map || cancelled) return;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = cities
        .filter((city) => city.latitude != null && city.longitude != null && city.slug)
        .map((city) => {
          const isFocused = focusSlug != null && city.slug === focusSlug;
          const dimmed = focusSlug != null && !isFocused;
          const el = markerElement(city, isFocused, dimmed);
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            if (city.slug) selectRef.current?.(city.slug);
          });
          return new maplibre.Marker({ element: el, anchor: "bottom" })
            .setLngLat([Number(city.longitude), Number(city.latitude)])
            .addTo(map);
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [cities, focusSlug]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const focused = focusSlug ? cities.find((city) => city.slug === focusSlug) : null;
    const fly = () => {
      if (focused?.latitude != null && focused.longitude != null) {
        map.flyTo({
          center: [Number(focused.longitude), Number(focused.latitude)],
          zoom: 10.5,
          duration: 2400,
          essential: true,
        });
      } else {
        map.flyTo({ center: INDIA_CENTER, zoom: 3.7, duration: 1600, essential: true });
      }
    };
    if (map.isStyleLoaded()) fly();
    else map.once("load", fly);
  }, [cities, focusSlug]);

  return <div ref={containerRef} className={className} aria-label="Map of India" role="region" />;
}
