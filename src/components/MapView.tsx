"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Lang, LANG_KEY, t } from "@/lib/translations";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [4.6, -74.08];
const DEFAULT_ZOOM = 5;
const STORAGE_KEY = "goldaxis-user-location";

/* ── Dark premium map tiles ── */
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

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: #D4AF37; border-radius: 50%;
    border: 3px solid #0A0A0A;
    box-shadow: 0 0 0 3px rgba(212,175,55,0.3), 0 0 16px rgba(212,175,55,0.5);
  ">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
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
  const [flown, setFlown] = useState(false);
  useEffect(() => {
    if (pos && !hasRoute) {
      if (!flown) {
        map.setView(pos, 15);
        setFlown(true);
      } else {
        map.flyTo(pos, 15, { duration: 1.5 });
      }
    }
  }, [pos, map, hasRoute, flown]);
  return null;
}

function GoHome({ pos, trigger }: { pos: [number, number] | null; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (pos && trigger > 0) {
      map.flyTo(pos, 16, { duration: 1 });
    }
  }, [trigger, pos, map]);
  return null;
}

/* ── localStorage helpers ── */
function getSavedLocation(): { lat: number; lng: number; address: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocation(lat: number, lng: number, address: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, address }));
}

/* ── Main ── */
export default function MapView() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [selected, setSelected] = useState<Commerce | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [settingsMode, setSettingsMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [goHomeTrigger, setGoHomeTrigger] = useState(0);
  const [lang, setLang] = useState<Lang>("es");

  // Check localStorage on mount
  useEffect(() => {
    const saved = getSavedLocation();
    if (saved) {
      setUserPos([saved.lat, saved.lng]);
      setUserAddress(saved.address);
    } else {
      setShowOnboarding(true);
    }
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;
    if (savedLang === "en" || savedLang === "es") setLang(savedLang);
    setReady(true);
  }, []);

  // Fetch commerces from API
  useEffect(() => {
    fetch("/api/commerces")
      .then((res) => res.json())
      .then((data) => setCommerces(data))
      .catch(() => {});
  }, []);

  function handleSetLocation(lat: number, lng: number, address: string) {
    setUserPos([lat, lng]);
    setUserAddress(address);
    saveLocation(lat, lng, address);
    setShowOnboarding(false);
    setSettingsMode(false);
  }

  function handleSkip() {
    setShowOnboarding(false);
    setSettingsMode(false);
  }

  function handleOpenSettings() {
    setSettingsMode(true);
    setShowOnboarding(true);
  }

  function handleLangChange(newLang: Lang) {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
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

  if (!ready) return null;

  return (
    <div className="relative w-full h-full bg-[#0A0A0A]">
      {/* Address onboarding / Settings */}
      {showOnboarding && (
        <LocationPermission
          onSetLocation={handleSetLocation}
          onSkip={handleSkip}
          lang={lang}
          onLangChange={handleLangChange}
          isSettings={settingsMode}
        />
      )}

      {/* Loading route */}
      {loadingRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          {t("tracingRoute", lang)}
        </div>
      )}

      {/* Home & Settings */}
      {!showOnboarding && (
        <div className="absolute bottom-4 left-4 z-[900] flex items-center gap-2 safe-bottom">
          {userAddress && (
            <button
              onClick={() => setGoHomeTrigger((n) => n + 1)}
              className="bg-[#141414] border border-[#2A2A2A] w-11 h-11 rounded-full flex items-center justify-center text-[#D4AF37] active:bg-[#D4AF37]/10 active:border-[#D4AF37]/30 transition-all shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Settings button */}
      {!showOnboarding && (
        <button
          onClick={handleOpenSettings}
          className="absolute top-4 right-4 z-[1100] bg-[#141414] border border-[#2A2A2A] w-11 h-11 rounded-full flex items-center justify-center text-[#D4AF37] active:bg-[#D4AF37]/10 active:border-[#D4AF37]/30 transition-all shadow-lg safe-top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      <MapContainer
        center={userPos || DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer attribution="" url={TILE_URL} />
        <FlyToUser pos={userPos} hasRoute={!!route} />
        <GoHome pos={userPos} trigger={goHomeTrigger} />
        <FitRoute route={route} />

        {userPos && <Marker position={userPos} icon={homeIcon} />}

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
          lang={lang}
          onSelect={(c) => {
            setSelected(c);
            setRoute(null);
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
          lang={lang}
          onNavigate={() => handleNavigate(selected)}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
