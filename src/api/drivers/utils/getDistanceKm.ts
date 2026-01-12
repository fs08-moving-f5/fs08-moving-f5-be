import haversine from 'haversine-distance';

export const getDistanceKm = (params: {
  from: {
    lat: number;
    lng: number;
  };
  to: {
    lat: number;
    lng: number;
  };
}): number => {
  const meter = haversine(
    {
      lat: params.from.lat,
      lon: params.from.lng,
    },
    {
      lat: params.to.lat,
      lon: params.to.lng,
    },
  );

  return meter / 1000;
};
