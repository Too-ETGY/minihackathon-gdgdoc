"use client";

import { useState, useEffect, useCallback } from "react";
import MapDynamic from "@/components/map/MapDynamic";
import ReportModal from "@/components/report/ReportModal";
import { DamageMarker, ReportFormData } from "@/types/report";
import { submitDamageReport, fetchDamageReports } from "@/lib/reportApi";

export default function MapPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [markers, setMarkers] = useState<DamageMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch existing damage reports on mount
  useEffect(() => {
    loadMarkers();
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

  const handleSubmit = useCallback(async (data: ReportFormData) => {
    try {
      await submitDamageReport(data);

      // Show success notification
      setNotification({
        type: "success",
        message: "Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.",
      });

      // Reload markers to show the new report
      await loadMarkers();

      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal mengirim laporan",
      });

      // Auto-hide error after 5 seconds
      setTimeout(() => setNotification(null), 5000);

      throw error;
    }
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[3000] px-6 py-4 rounded-lg shadow-2xl max-w-md ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
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

      {/* Map Component */}
      <MapDynamic markers={markers} onReportClick={() => setIsModalOpen(true)} />

      {/* Report Modal */}
      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}
