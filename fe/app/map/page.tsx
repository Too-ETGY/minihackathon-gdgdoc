"use client";

import { useState, useEffect, useCallback } from "react";
import MapDynamic from "@/components/map/MapDynamic";
import ReportModal from "@/components/report/ReportModal";
import { DamageMarker, ReportFormData } from "@/types/report";
import { submitDamageReport, fetchDamageReports } from "@/lib/reportApi";
import NavbarForSearch from "@/components/layout/Navbar";
import RoutingNavbar from "@/components/layout/RoutingNavbar";
import { Location } from "@/types";
import { getRoute, RouteResponse } from "@/lib/routingApi";
import { getCurrentPosition } from "@/types/geocoding";

export default function MapPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [markers, setMarkers] = useState<DamageMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  
  const [currentMode, setCurrentMode] = useState<'explore' | 'damaged' | 'project'>('explore');
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [destination, setDestination] = useState<{ location: Location; name: string } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    loadMarkers();
    loadCurrentLocation();
  }, []);

  const loadMarkers = async () => {
    setIsLoading(true);
    try {
      const reports = await fetchDamageReports();
      setMarkers(reports);
    } catch (error) {
      console.error("Error loading markers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentLocation = async () => {
    try {
      const location = await getCurrentPosition();
      setCurrentLocation(location);
    } catch (error) {
      console.error("Cannot get current location:", error);
    }
  };

  const handleSubmit = useCallback(async (data: ReportFormData) => {
    try {
      await submitDamageReport(data);

      setNotification({
        type: "success",
        message: "Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.",
      });

      await loadMarkers();

      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal mengirim laporan",
      });

      setTimeout(() => setNotification(null), 5000);

      throw error;
    }
  }, []);

  const handleDestinationSelect = async (location: Location, name: string) => {
    setDestination({ location, name });
    setIsRoutingMode(true);
    
    if (currentLocation) {
      try {
        const route = await getRoute(currentLocation, location);
        setRouteData(route);
      } catch (error) {
        console.error("Routing error:", error);
        setNotification({
          type: "error",
          message: "Gagal membuat rute. Coba lagi.",
        });
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  const handleRouteRequest = async (origin: Location, dest: Location) => {
    try {
      const route = await getRoute(origin, dest);
      setRouteData(route);
    } catch (error) {
      console.error("Routing error:", error);
    }
  };

  const handleCloseRouting = () => {
    setIsRoutingMode(false);
    setRouteData(null);
    setDestination(null);
  };

  const handleModeChange = (mode: 'explore' | 'damaged' | 'project') => {
    setCurrentMode(mode);
  };

  return (
    <div className="relative w-full h-screen">
      {!isRoutingMode ? (
        <NavbarForSearch
          onDestinationSelect={handleDestinationSelect}
          onModeChange={handleModeChange}
          currentMode={currentMode}
        />
      ) : (
        <RoutingNavbar
          initialOrigin={currentLocation}
          initialDestination={destination?.location || null}
          destinationName={destination?.name || ''}
          onRouteRequest={handleRouteRequest}
          onClose={handleCloseRouting}
        />
      )}

      {isLoading && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      )}

      {notification && (
        <div className={`fixed top-32 left-1/2 -translate-x-1/2 z-[3000] px-6 py-4 rounded-lg shadow-2xl max-w-md ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="font-medium">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-auto hover:opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <MapDynamic 
        markers={markers} 
        onReportClick={() => setIsModalOpen(true)}
        // routeData={routeData}
        // currentMode={currentMode}
      />

      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}