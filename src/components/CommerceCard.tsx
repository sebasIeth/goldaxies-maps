"use client";

import { useState } from "react";
import Image from "next/image";
import { Commerce } from "@/types/commerce";
import { formatDistance } from "@/lib/geo";
import { RouteResult } from "@/lib/routing";
import { Lang, t } from "@/lib/translations";

interface Props {
  commerce: Commerce;
  distanceKm: number | null;
  route: RouteResult | null;
  loadingRoute: boolean;
  hasUserPos: boolean;
  lang: Lang;
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
  lang,
  onNavigate,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  // Collapsed bubble
  if (!expanded) {
    return (
      <div className="fixed top-3 left-3 right-3 z-[1000] safe-top">
        <div className="mx-auto max-w-lg flex items-center gap-2">
          {/* Bubble card */}
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 flex items-center gap-3 bg-[#141414]/95 backdrop-blur-sm border border-[#2A2A2A] rounded-full px-3 py-2 shadow-lg active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] flex-shrink-0 relative">
              <Image src={commerce.image || commerce.logo} alt={commerce.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm font-semibold truncate">{commerce.name}</h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-500 truncate">{commerce.type}</span>
                {distanceKm !== null && (
                  <span className="text-[#D4AF37] font-semibold flex-shrink-0">{formatDistance(distanceKm)}</span>
                )}
                {route && (
                  <span className="text-[#D4AF37] font-semibold flex-shrink-0">{formatDuration(route.durationMin)}</span>
                )}
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#141414]/95 backdrop-blur-sm border border-[#2A2A2A] flex items-center justify-center text-gray-500 active:text-white transition-colors shadow-lg flex-shrink-0 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Expanded card
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] p-3 pt-[env(safe-area-inset-top,12px)]">
      {/* Lightbox */}
      {lightbox && commerce.image && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 safe-top safe-bottom" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition-colors text-lg safe-top">✕</button>
          <div className="relative w-full max-w-lg aspect-square">
            <Image src={commerce.image} alt={commerce.name} fill className="object-contain" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Collapse / Close buttons */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button onClick={() => setExpanded(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#2A2A2A] text-gray-500 active:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#2A2A2A] text-gray-500 active:text-white transition-colors text-xs">
            ✕
          </button>
        </div>

        {/* Commerce image banner */}
        {commerce.image && (
          <div className="relative w-full h-36 cursor-pointer" onClick={() => setLightbox(true)}>
            <Image src={commerce.image} alt={commerce.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center justify-between px-4 pb-2 ${commerce.image ? "-mt-8 relative z-10" : "pt-4"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] flex-shrink-0 relative ${commerce.image ? "cursor-pointer" : ""}`} onClick={() => commerce.image && setLightbox(true)}>
              <Image src={commerce.image || commerce.logo} alt={commerce.name} fill className={commerce.image ? "object-cover" : "object-cover p-1"} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{commerce.name}</h3>
              <span className="text-xs text-[#D4AF37] font-medium">{commerce.type}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pb-2">
          <p className="text-gray-400 text-xs leading-relaxed">{commerce.description}</p>
        </div>

        {/* Phone */}
        {commerce.phone && (
          <div className="px-4 pb-2 flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${commerce.phone}`} className="hover:text-[#D4AF37] transition-colors">{commerce.phone}</a>
          </div>
        )}

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
              className="block w-full text-center py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loadingRoute ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  {t("tracingRoute", lang)}
                </span>
              ) : route ? t("recalcRoute", lang) : t("getDirections", lang)}
            </button>
          ) : (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${commerce.lat},${commerce.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl active:scale-[0.98] transition-all text-sm"
            >
              {t("getDirections", lang)}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
