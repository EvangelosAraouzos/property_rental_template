"use client";

import dynamic from "next/dynamic";

export interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  address: string;
  type?: "luxury" | "rustic";
}

interface MapProps {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom: number;
}

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center">
      <span className="text-muted-foreground text-sm animate-pulse">Loading map…</span>
    </div>
  ),
});

export function Map(props: MapProps) {
  return <LeafletMap {...props} />;
}
