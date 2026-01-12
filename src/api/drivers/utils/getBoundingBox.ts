export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export const getBoundingBox = (params: {
  lat: number;
  lng: number;
  radiusKm: number;
}): BoundingBox => {
  const { lat, lng, radiusKm } = params;

  const kmPerLatDegree = 111.32;
  const deltaLat = radiusKm / kmPerLatDegree;

  const latRad = (lat * Math.PI) / 180;
  const kmPerLngDegree = Math.cos(latRad) * 111.32;
  const deltaLng = radiusKm / kmPerLngDegree;

  return {
    minLat: lat - deltaLat,
    minLng: lng - deltaLng,
    maxLat: lat + deltaLat,
    maxLng: lng + deltaLng,
  };
};
