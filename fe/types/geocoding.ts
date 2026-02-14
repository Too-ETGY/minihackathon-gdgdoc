import { Place, Location } from '@/types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=id`,
      {
        headers: {
          'User-Agent': 'RamahRute-App/1.0'
        }
      }
    );

    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();

    return data.map((item: any) => ({
      name: item.name,
      displayName: item.display_name,
      location: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

export function getCurrentPosition(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}