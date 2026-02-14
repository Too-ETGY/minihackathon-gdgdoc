"use client";

import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom damage marker icon
const selectedIcon = new Icon({
  iconUrl: "/koordinat-rusak.svg",
  iconSize: [42, 42],
  iconAnchor: [0, 42],
  popupAnchor: [21, -42],
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  fullHeight?: boolean;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} icon={selectedIcon} />;
}

// Component to update map center dynamically
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }, [center, map]);

  return null;
}

export default function MapPicker({
  onLocationSelect,
  center = [-6.2088, 106.8456], // Default: Jakarta
  zoom = 13,
  fullHeight = false,
}: MapPickerProps) {
  const containerClass = fullHeight ? "w-full h-full" : "w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300";

  return (
    <div className={containerClass}>
      <MapContainer center={center} zoom={zoom} className="w-full h-full" zoomControl={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onLocationSelect={onLocationSelect} />
        <MapCenterUpdater center={center} />
      </MapContainer>
    </div>
  );
}
