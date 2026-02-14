"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ReportFormData, DamageType } from "@/types/report";
import { searchAddress, reverseGeocode, debounce, GeocodingResult } from "@/lib/geocoding";
import NavbarForSearch from "@/components/layout/Navbar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Category {
  id: number;
  name: string;
  icon_url: string | null;
}

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

  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // Address search state
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentMode, setCurrentMode] = useState<"explore" | "damaged" | "project">("explore");

  // Fetch categories from API
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const result = await response.json();
        if (result.status && result.data) {
          setCategories(result.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchAddress(query);
        setSearchResults(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [],
  );

  // Handle location input change
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, locationDetail: value });
    debouncedSearch(value);
  };

  // Handle selecting a search result
  const handleSelectAddress = (result: GeocodingResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setFormData({
      ...formData,
      locationDetail: result.display_name,
      latitude: lat,
      longitude: lon,
    });
    setMapCenter([lat, lon]);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  // Handle map click - reverse geocode
  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Reverse geocode to get address
    try {
      const address = await reverseGeocode(lat, lng);
      setFormData((prev) => ({
        ...prev,
        locationDetail: address,
      }));
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  }, []);

  // Handle navbar location select
  const handleNavbarLocationSelect = (location: { lat: number; lng: number }, name: string) => {
    setFormData({
      ...formData,
      locationDetail: name,
      latitude: location.lat,
      longitude: location.lng,
    });
    setMapCenter([location.lat, location.lng]);
  };

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
      setMapCenter([-6.2088, 106.8456]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* Navbar - positioned at the top with higher z-index */}
      <div className="absolute top-0 left-80 right-0 z-[2002]">
        <NavbarForSearch onLocationSelect={handleNavbarLocationSelect} onModeChange={setCurrentMode} currentMode={currentMode} />
      </div>

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
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-5 overflow-y-hidden">
            {/* Error Message */}
            {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}

            {/* Nama/Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Nama
              </label>
              <input id="email" type="text" placeholder="Masukkan Email" className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all placeholder:text-gray-400" />
            </div>

            {/* Tempat Field with Autocomplete */}
            <div className="space-y-2 relative" ref={searchInputRef}>
              <label htmlFor="locationDetail" className="block text-sm font-medium text-white">
                Tempat
              </label>
              <input
                id="locationDetail"
                type="text"
                value={formData.locationDetail}
                onChange={handleLocationInputChange}
                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                placeholder="Masukkan Tempat"
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all placeholder:text-gray-400"
                autoComplete="off"
              />

              {/* Search indicator */}
              {isSearching && (
                <div className="absolute right-3 top-11 text-gray-400">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}

              {/* Autocomplete suggestions */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button key={index} type="button" onClick={() => handleSelectAddress(result)} className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 text-sm text-gray-700">
                      <div className="font-medium">{result.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                <option value="" disabled hidden>
                  {isCategoriesLoading ? "Memuat..." : "Jenis Kerusakan"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
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
                placeholder="Jelaskan deskripsi kerusakan (opsional)"
                rows={5}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg outline-none transition-all resize-none placeholder:text-gray-400 flex-1"
              />
            </div>

            {/* Coordinates Display (if selected) */}
            {formData.latitude && formData.longitude && (
              <div className="text-xs text-gray-400">
                Koordinat: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
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
          <MapPicker onLocationSelect={handleLocationSelect} center={mapCenter} fullHeight />
        </div>
      </div>
    </div>
  );
}
