export interface RouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
}

export async function getRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );

    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return null;
  }
}
