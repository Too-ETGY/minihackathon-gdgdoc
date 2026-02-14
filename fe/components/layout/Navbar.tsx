'use client';

import { useState, useEffect, useRef } from 'react';
import { searchPlaces, getCurrentPosition } from '@/types/geocoding';
import { Place, Location } from '@/types';

interface NavbarProps {
  onLocationSelect: (location: Location, name: string) => void;
  onNavigateRequest: (from: Location, to: Location, destinationName: string) => void;
  onModeChange: (mode: 'explore' | 'damaged' | 'project') => void;
  currentMode: 'explore' | 'damaged' | 'project';
}

export default function NavbarForSearch({ onLocationSelect, onNavigateRequest, onModeChange, currentMode }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCurrentUserLocation();
  }, []);

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

  const getCurrentUserLocation = async () => {
    try {
      const location = await getCurrentPosition();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Cannot get current location:', error);
    }
  };

  const handleSelectPlace = async (place: Place) => {
    setSelectedDestination(place);
    setSearchQuery('');
    setShowResults(false);
    onLocationSelect(place.location, place.name);
    
    const nearby = await searchNearbyPlaces(place.location);
    setNearbyPlaces(nearby);
  };

  const searchNearbyPlaces = async (location: Location): Promise<Place[]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json&addressdetails=1&extratags=1`,
        {
          headers: { 'User-Agent': 'RamahRute-App/1.0' }
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      const nearbyQuery = data.address?.city || data.address?.town || data.address?.suburb || '';
      if (nearbyQuery) {
        return await searchPlaces(nearbyQuery);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching nearby:', error);
      return [];
    }
  };

  const handleNavigateToDestination = async (destination: Place) => {
    if (!currentLocation) {
      alert('Lokasi Anda belum terdeteksi. Mengaktifkan GPS...');
      try {
        const location = await getCurrentPosition();
        setCurrentLocation(location);
        onNavigateRequest(location, destination.location, destination.name);
      } catch (error) {
        alert('Tidak dapat mengakses lokasi GPS.');
        return;
      }
    } else {
      onNavigateRequest(currentLocation, destination.location, destination.name);
    }
    
    setSelectedDestination(null);
    setNearbyPlaces([]);
  };

  const handleClearDestination = () => {
    setSelectedDestination(null);
    setNearbyPlaces([]);
    setSearchQuery('');
  };

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-4xl px-4 pt-4">
      <div className="bg-white rounded-2xl shadow-lg px-6 py-4 mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">RamahRute</h1>
            <div className="w-px h-8 bg-gray-300"></div>
          </div>
          
          <div className="relative flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border-0 text-black bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black"
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
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
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
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500">
                Mencari...
              </div>
            )}
          </div>

          {selectedDestination && (
            <button
              onClick={handleClearDestination}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {nearbyPlaces.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Pilih tujuan:</p>
            <div className="space-y-2">
              {nearbyPlaces.slice(0, 3).map((place, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigateToDestination(place)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">{place.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onModeChange.bind(null, 'explore')}
          className={`px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
            currentMode === 'explore'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          Kerusakan Jalan
        </button>
        <button
          onClick={() => onModeChange('damaged')}
          className={`px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
            currentMode === 'damaged'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          Trotoar berlubang
        </button>
        <button
          onClick={() => onModeChange('project')}
          className={`px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
            currentMode === 'project'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          Jalur proyek
        </button>
      </div>
    </div>
  );
}