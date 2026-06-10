"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import { Commerce } from "@/types/commerce";
import { getDistanceKm } from "@/lib/geo";
import { getRoute, RouteResult } from "@/lib/routing";
import CommerceCard from "./CommerceCard";
import CommerceList from "./CommerceList";
import LocationPermission from "./LocationPermission";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [6.3375, -75.5565];
const DEFAULT_ZOOM = 15;

/* ── Dark premium map tiles (no Google, no API key) ── */
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

/* ── Custom markers ── */
function createIcon(color: string, glow: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      border: 2px solid rgba(255,255,255,0.3);
      box-shadow: 0 0 12px ${glow}, 0 2px 8px rgba(0,0,0,0.5);
    "><div style="
      width: 10px; height: 10px; border-radius: 50%;
      background: #0A0A0A; position: absolute;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

const commerceIcon = createIcon("#D4AF37", "rgba(212,175,55,0.4)");
const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 16px; height: 16px; border-radius: 50%;
    background: #D4AF37; border: 3px solid #0A0A0A;
    box-shadow: 0 0 0 3px rgba(212,175,55,0.3), 0 0 16px rgba(212,175,55,0.5);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/* ── Map helpers ── */
function FitRoute({ route }: { route: RouteResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.coordinates.length > 1) {
      const bounds = L.latLngBounds(route.coordinates.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [route, map]);
  return null;
}

function FlyToUser({ pos, hasRoute }: { pos: [number, number] | null; hasRoute: boolean }) {
  const map = useMap();
  const flown = useRef(false);
  useEffect(() => {
    if (pos && !flown.current && !hasRoute) {
      map.flyTo(pos, 15, { duration: 1.5 });
      flown.current = true;
    }
  }, [pos, map, hasRoute]);
  return null;
}

/* ── Main ── */
export default function MapView() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<Commerce | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [permissionStep, setPermissionStep] = useState<"ask" | "done">("ask");
  const watchRef = useRef<number | null>(null);

  // Fetch commerces from API
  useEffect(() => {
    fetch("/api/commerces")
      .then((res) => res.json())
      .then((data) => setCommerces(data))
      .catch(() => {});
  }, []);

  function startGeolocation() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización");
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => setGeoError("No pudimos acceder a tu ubicación"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  function handleAllowLocation() {
    setPermissionStep("done");
    startGeolocation();
  }

  function handleDenyLocation() {
    setPermissionStep("done");
  }

  function getDistanceTo(c: Commerce): number | null {
    if (!userPos) return null;
    return getDistanceKm(userPos[0], userPos[1], c.lat, c.lng);
  }

  const handleNavigate = useCallback(
    async (commerce: Commerce) => {
      if (!userPos) return;
      setLoadingRoute(true);
      const result = await getRoute(userPos[0], userPos[1], commerce.lat, commerce.lng);
      setRoute(result);
      setLoadingRoute(false);
    },
    [userPos]
  );

  function handleClose() {
    setSelected(null);
    setRoute(null);
  }

  const sorted = [...commerces].sort((a, b) => {
    const da = getDistanceTo(a);
    const db = getDistanceTo(b);
    if (da === null || db === null) return 0;
    return da - db;
  });

  return (
    <div className="relative w-full h-full bg-[#0A0A0A]">
      {/* Privacy dialog */}
      {permissionStep === "ask" && (
        <LocationPermission onAllow={handleAllowLocation} onDeny={handleDenyLocation} />
      )}

      {/* Geo error */}
      {geoError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#141414] border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-xl text-xs shadow-lg">
          {geoError}
        </div>
      )}

      {/* Loading route */}
      {loadingRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          Trazando ruta...
        </div>
      )}

      <MapContainer
        center={userPos || DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
        <FlyToUser pos={userPos} hasRoute={!!route} />
        <FitRoute route={route} />

        {userPos && <Marker position={userPos} icon={userIcon} />}

        {sorted.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={commerceIcon}
            eventHandlers={{
              click: () => {
                setSelected(c);
                setRoute(null);
              },
            }}
          />
        ))}

        {route && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{
              color: "#D4AF37",
              weight: 4,
              opacity: 0.9,
              dashArray: "8 6",
            }}
          />
        )}
      </MapContainer>

      {!selected && (
        <CommerceList
          commerces={sorted}
          getDistance={getDistanceTo}
          open={listOpen}
          onToggle={() => setListOpen((v) => !v)}
          onSelect={(c) => {
            setSelected(c);
            setRoute(null);
            setListOpen(false);
          }}
        />
      )}

      {selected && (
        <CommerceCard
          commerce={selected}
          distanceKm={getDistanceTo(selected)}
          route={route}
          loadingRoute={loadingRoute}
          hasUserPos={!!userPos}
          onNavigate={() => handleNavigate(selected)}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
