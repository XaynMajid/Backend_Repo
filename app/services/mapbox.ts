import Mapbox from '@rnmapbox/maps';

// Initialize Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw');

// Function to calculate coordinate at distance
export function calculateCoordinateAtDistance(startLat: number, startLng: number, distanceKm: number, bearingDegrees: number): [number, number] {
  const R = 6371; // Earth's radius in km
  const d = distanceKm / R; // Distance in radians
  const bearing = bearingDegrees * Math.PI / 180; // Bearing in radians
  
  const lat1 = startLat * Math.PI / 180;
  const lng1 = startLng * Math.PI / 180;
  
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return [
    (lng2 * 180 / Math.PI + 540) % 360 - 180, // Convert back to degrees and normalize
    lat2 * 180 / Math.PI
  ] as [number, number];
}

// Function to get directions using Mapbox Directions API
export async function getDirections(start: [number, number], end: [number, number]) {
  const accessToken = 'pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw';
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${accessToken}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }
}

// Default export
const MapboxService = {
  calculateCoordinateAtDistance,
  getDirections,
};

export default MapboxService;