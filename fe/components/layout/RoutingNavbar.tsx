'use client';

import { useState, useEffect } from 'react';
import { Location, Place } from '@/types';
import { searchPlaces, getCurrentPosition } from '@/types/geocoding';

interface RoutingNavbarProps {
  initialOrigin: Location | null;
  initialDestination: Location | null;
  destinationName: string;
  onRouteRequest: (origin: Location, destination: Location) => void;
  onClose: () => void;
}

export default function RoutingNavbar({
  initialOrigin,
  initialDestination,
  destinationName,
  onRouteRequest,
  onClose
}: RoutingNavbarProps) {
  const [originQuery, setOriginQuery] = useState('Current Location');
  const [destQuery, setDestQuery] = useState(destinationName);
  const [origin, setOrigin] = useState<Location | null>(initialOrigin);
  const [destination, setDestination] = useState<Location | null>(initialDestination);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  useEffect(() => {
    if (initialOrigin && initialDestination) {
      onRouteRequest(initialOrigin, initialDestination);
    }
  }, []);

  const handleSearchInput = async (query: string, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOriginQuery(query);
    } else {
      setDestQuery(query);
    }

    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const results = await searchPlaces(query);
    setSearchResults(results);
    setActiveInput(type);
  };

  const handleSelectPlace = (place: Place, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOrigin(place.location);
      setOriginQuery(place.name);
    } else {
      setDestination(place.location);
      setDestQuery(place.name);
    }
    setSearchResults([]);
    setActiveInput(null);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentPosition();
      setOrigin(location);
      setOriginQuery('Current Location');
      setSearchResults([]);
      setActiveInput(null);
    } catch (error) {
      alert('Cannot access GPS');
    }
  };

  const handleSubmit = () => {
    if (!origin || !destination) {
      alert('Silakan pilih lokasi asal dan tujuan');
      return;
    }
    onRouteRequest(origin, destination);
  };

  const canSubmit = origin !== null && destination !== null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-5xl px-4">
      <div className="bg-white rounded-2xl shadow-lg px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">RamahRute</h1>
            <div className="w-px h-16 bg-gray-300"></div>
          </div>

          <div className="flex flex-col items-center gap-2 pt-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="w-0.5 h-8 bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
          </div>

          <div className="flex-1 space-y-3 relative">
            <div className="relative">
              <input
                type="text"
                value={originQuery}
                onChange={(e) => handleSearchInput(e.target.value, 'origin')}
                onFocus={() => setActiveInput('origin')}
                placeholder="Origin"
                className="w-full px-4 py-2 text-black bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {activeInput === 'origin' && originQuery !== 'Current Location' && (
                <button
                  onClick={handleUseCurrentLocation}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:underline"
                >
                  Use GPS
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={destQuery}
                onChange={(e) => handleSearchInput(e.target.value, 'destination')}
                onFocus={() => setActiveInput('destination')}
                placeholder="Destination"
                className="w-full px-4 py-2 text-black bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {searchResults.length > 0 && activeInput && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-10">
                {searchResults.map((place, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectPlace(place, activeInput)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="font-medium text-gray-900 text-sm">{place.name}</p>
                    <p className="text-xs text-gray-500 truncate">{place.displayName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full max-w-md px-8 py-2 rounded-xl font-semibold text-md transition-all ${
              canSubmit
                ? 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Cari Rute
          </button>
        </div>
      </div>
    </div>
  );
}