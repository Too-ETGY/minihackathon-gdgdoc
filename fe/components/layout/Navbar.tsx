'use client';

import { useState, useEffect, useRef } from 'react';
import { searchPlaces, getCurrentPosition } from '@/types/geocoding';
import { Place, Location } from '@/types';

interface NavbarProps {
  onLocationSelect: (location: Location, name: string) => void;
  onModeChange: (mode: 'explore' | 'damaged' | 'project') => void;
  currentMode: 'explore' | 'damaged' | 'project';
}

export default function NavbarForSearch({ onLocationSelect, onModeChange, currentMode }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);;

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentPosition();
      onLocationSelect(location, 'Lokasi Anda');
      setSearchQuery('Lokasi Anda');
      setShowResults(false);
    } catch (error) {
      alert('Tidak dapat mengakses lokasi GPS. Pastikan izin lokasi diaktifkan.');
    }
  };

  const handleSelectPlace = (place: Place) => {
    onLocationSelect(place.location, place.name);
    setSearchQuery(place.displayName);
    setShowResults(false);
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">RamahRute</h1>
            
            <div className="relative w-96">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {searchResults.map((place, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectPlace(place)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{place.name}</p>
                      <p className="text-sm text-gray-500 truncate">{place.displayName}</p>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Mencari...
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUseCurrentLocation}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'explore'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border-2 border-black hover:bg-gray-100'
              }`}
            >
              Kerusakan Jalan
            </button>
            <button
              onClick={() => onModeChange('damaged')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'damaged'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border-2 border-black hover:bg-gray-100'
              }`}
            >
              Trotoar berlubang
            </button>
            <button
              onClick={() => onModeChange('project')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'project'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border-2 border-black hover:bg-gray-100'
              }`}
            >
              Jalur proyek
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}