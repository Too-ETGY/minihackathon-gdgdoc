"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ReportFormData, DamageType } from "@/types/report";

// Dynamic import for map picker
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => Promise<void>;
}

const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: "crack", label: "Retak" },
  { value: "hole", label: "Berlubang" },
  { value: "severe", label: "Rusak Berat" },
  { value: "other", label: "Lainnya" },
];

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    latitude: null,
    longitude: null,
    locationDetail: "",
    damageType: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.latitude || !formData.longitude) {
      setError("Silakan pilih lokasi pada peta");
      return;
    }
    if (!formData.locationDetail.trim()) {
      setError("Tempat harus diisi");
      return;
    }
    if (!formData.damageType) {
      setError("Jenis kerusakan harus dipilih");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        latitude: null,
        longitude: null,
        locationDetail: "",
        damageType: "",
        description: "",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* Close button - top right */}
      <button onClick={onClose} className="absolute top-4 right-4 z-[2001] text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2" aria-label="Close">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Layout Container */}
      <div className="flex h-full">
        {/* Left Sidebar - Dark with form */}
        <div className="w-80 bg-gradient-to-b from-gray-900 to-black flex flex-col ml-4 my-4 rounded-lg">
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-5 overflow-y-hidden ">
            {/* Error Message */}
            {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}

            {/* Nama/Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Nama
              </label>
              <input id="email" type="text" placeholder="Masukkan Email" className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all placeholder:text-gray-400" />
            </div>

            {/* Tempat Field */}
            {/* <div className="space-y-2">
              <label htmlFor="locationDetail" className="block text-sm font-medium text-white">
                Tempat
              </label>
              <input
                id="locationDetail"
                type="text"
                value={formData.locationDetail}
                onChange={(e) => setFormData({ ...formData, locationDetail: e.target.value })}
                placeholder="Masukkan Tempat"
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all placeholder:text-gray-400"
              />
            </div> */}

            {/* Jenis Kerusakan */}
            <div className="space-y-2">
              <label htmlFor="damageType" className="block text-sm font-medium text-white">
                Jenis Kerusakan
              </label>
              <select
                id="damageType"
                value={formData.damageType}
                onChange={(e) => setFormData({ ...formData, damageType: e.target.value as DamageType | "" })}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.25rem",
                }}
              >
                <option value="">Jenis Kerusakan</option>
                {DAMAGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Deskripsi Kerusakan */}
            <div className="space-y-2 flex-1 flex flex-col">
              <label htmlFor="description" className="block text-sm font-medium text-white">
                Deskripsi Kerusakan
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi kerusakan"
                rows={5}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all resize-none placeholder:text-gray-400 flex-1"
              />
            </div>

            {/* Coordinates Display (if selected) */}
            {formData.latitude && formData.longitude && (
              <div className="text-xs text-gray-400">
                📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-[120px] px-6 py-3 text-center bg-white text-black rounded-lg hover:bg-gray-100 transition-all font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? "Memposting..." : "Posting"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Full Map */}
        <div className="flex-1 relative">
          <MapPicker onLocationSelect={handleLocationSelect} fullHeight />
        </div>
      </div>
    </div>
  );
}
