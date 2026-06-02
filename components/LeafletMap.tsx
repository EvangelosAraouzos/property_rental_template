"use client";

import { useEffect, useRef } from "react";
import type { MapMarker } from "./Map";

interface LeafletMapProps {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom: number;
}

export default function LeafletMap({ markers, center, zoom }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: import("leaflet").Map | null = null;

    import("leaflet").then((L) => {
      // Fix Leaflet default icon paths broken by bundlers
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const luxuryIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;border-radius:50%;background:#1f6f8b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">★</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const rusticIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;border-radius:50%;background:#c9714b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">★</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      map = L.map(containerRef.current!, {
        center: [center.lat, center.lng],
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markers.forEach(({ lat, lng, name, address, type }) => {
        const icon = type === "rustic" ? rusticIcon : luxuryIcon;
        const popup = L.popup({ className: "onar-popup" }).setContent(
          `<div style="font-family:system-ui,sans-serif;padding:4px"><strong style="font-size:13px">${name}</strong><p style="font-size:11px;color:#666;margin:4px 0 0">${address}</p></div>`
        );
        L.marker([lat, lng], { icon }).addTo(map!).bindPopup(popup);
      });
    });

    import("leaflet/dist/leaflet.css");

    return () => {
      map?.remove();
    };
  }, [markers, center, zoom]);

  return <div ref={containerRef} className="w-full h-full min-h-[380px] rounded-2xl z-0" />;
}
