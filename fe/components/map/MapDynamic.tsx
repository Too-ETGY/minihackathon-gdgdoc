"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DamageMarker } from "@/types/report";

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface MapDynamicProps {
  markers?: DamageMarker[];
  onReportClick?: () => void;
}

export default function MapDynamic({ markers = [], onReportClick }: MapDynamicProps) {
  return (
    <div className="relative w-full h-screen">
      <MapView markers={markers} />

      {/* Floating Action Button */}
      <button
        onClick={onReportClick}
        className="cursor-pointer fixed bottom-12 right-12 z-[1000] w-16 h-16 bg-black text-white rounded-full shadow-lg hover:bg-black hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Add damage report"
      >
        <svg className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
