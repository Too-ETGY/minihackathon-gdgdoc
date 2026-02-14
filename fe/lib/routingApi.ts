import { Location } from '@/types';

export interface RouteSegment {
  coordinates: [number, number][];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RouteResponse {
  segments: RouteSegment[];
  distance: number;
  duration: number;
  totalRisk: number;
  origin: Location;
  destination: Location;
}

export async function getRoute(origin: Location, destination: Location): Promise<RouteResponse> {
  try {
    const osrmResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
      {
        headers: {
          'User-Agent': 'RamahRute-App/1.0'
        }
      }
    );

    if (!osrmResponse.ok) throw new Error('Routing failed');

    const osrmData = await osrmResponse.json();

    if (!osrmData.routes || osrmData.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = osrmData.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: number[]) => [coord[1], coord[0]]
    );

    const riskEvaluation = await evaluateRouteRisk(coordinates);

    return {
      segments: riskEvaluation.segments,
      distance: route.distance,
      duration: route.duration,
      totalRisk: riskEvaluation.totalRisk,
      origin,
      destination
    };
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
}

async function evaluateRouteRisk(coordinates: [number, number][]): Promise<{
  segments: RouteSegment[];
  totalRisk: number;
}> {
  const segmentSize = Math.ceil(coordinates.length / 10);
  const segments: RouteSegment[] = [];
  
  for (let i = 0; i < coordinates.length; i += segmentSize) {
    const segmentCoords = coordinates.slice(i, i + segmentSize);
    
    const mockRisk = Math.random();
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    
    if (mockRisk < 0.4) {
      riskLevel = 'LOW';
    } else if (mockRisk < 0.7) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'HIGH';
    }
    
    segments.push({
      coordinates: segmentCoords,
      riskLevel
    });
  }
  
  const totalRisk = segments.reduce((sum, seg) => {
    const risk = seg.riskLevel === 'HIGH' ? 10 : seg.riskLevel === 'MEDIUM' ? 5 : 1;
    return sum + risk;
  }, 0);
  
  return { segments, totalRisk };
}