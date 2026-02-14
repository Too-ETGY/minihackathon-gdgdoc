"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { DamageMarker } from "@/types/report";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons - use CDN URLs to avoid Next.js import issues
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";

// Custom icons for different damage types
const getDamageIcon = (type: string) => {
  const colors: Record<string, string> = {
    crack: "#f59e0b", // amber
    hole: "#ef4444", // red
    severe: "#dc2626", // dark red
    other: "#6b7280", // gray
  };

  const color = colors[type] || colors.other;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

interface MapViewProps {
  markers: DamageMarker[];
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  markers,
  center = [-6.2088, 106.8456], // Default: Jakarta
  zoom = 13,
}: MapViewProps) {
  return (
    <MapContainer center={center} zoom={zoom} className="w-full h-full" zoomControl={true}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={getDamageIcon(marker.damageType)}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold capitalize">{marker.damageType.replace("_", " ")}</p>
              <p className="text-gray-600">Status: {marker.status}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(marker.timestamp).toLocaleDateString("id-ID")}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
