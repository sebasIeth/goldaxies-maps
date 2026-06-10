"use client";

import Image from "next/image";
import { Commerce } from "@/types/commerce";
import { formatDistance } from "@/lib/geo";
import { RouteResult } from "@/lib/routing";

interface Props {
  commerce: Commerce;
  distanceKm: number | null;
  route: RouteResult | null;
  loadingRoute: boolean;
  hasUserPos: boolean;
  onNavigate: () => void;
  onClose: () => void;
}

function formatDuration(min: number): string {
  if (min < 1) return "< 1 min";
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export default function CommerceCard({
  commerce,
  distanceKm,
  route,
  loadingRoute,
  hasUserPos,
  onNavigate,
  onClose,
}: Props) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] p-3 pt-[env(safe-area-inset-top,12px)]">
      <div className="mx-auto max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] flex-shrink-0 relative">
              <Image src={commerce.logo} alt={commerce.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{commerce.name}</h3>
              <span className="text-xs text-[#D4AF37] font-medium">{commerce.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-gray-500 hover:text-white transition-colors text-xs">
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="px-4 pb-2">
          <p className="text-gray-400 text-xs leading-relaxed">{commerce.description}</p>
        </div>

        {/* Address + Distance */}
        <div className="px-4 pb-2 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{commerce.address}</span>
          {distanceKm !== null && (
            <span className="ml-auto font-semibold text-[#D4AF37] whitespace-nowrap">{formatDistance(distanceKm)}</span>
          )}
        </div>

        {/* Route info */}
        {route && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-lg text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold">{formatDistance(route.distanceKm)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-lg text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{formatDuration(route.durationMin)}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="px-4 pb-4 pt-1">
          {hasUserPos ? (
            <button
              onClick={onNavigate}
              disabled={loadingRoute}
              className="block w-full text-center py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loadingRoute ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Trazando ruta...
                </span>
              ) : route ? "Recalcular ruta" : "Cómo llegar"}
            </button>
          ) : (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${commerce.lat},${commerce.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all text-sm"
            >
              Cómo llegar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
