"use client";

import Image from "next/image";
import { Commerce } from "@/types/commerce";
import { formatDistance } from "@/lib/geo";

interface Props {
  commerces: Commerce[];
  getDistance: (c: Commerce) => number | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (c: Commerce) => void;
}

export default function CommerceList({
  commerces,
  getDistance,
  open,
  onToggle,
  onSelect,
}: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[900] flex flex-col items-center pointer-events-none">
      <button
        onClick={onToggle}
        className="pointer-events-auto mt-3 flex items-center gap-2 bg-[#141414] border border-[#2A2A2A] px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold text-[#D4AF37] hover:bg-[#1A1A1A] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        {commerces.length} comercios cercanos
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div className="pointer-events-auto w-[calc(100%-2rem)] max-w-lg mt-2 mx-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-y-auto max-h-[50vh]">
          {commerces.map((c, i) => {
            const dist = getDistance(c);
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors text-left ${
                  i < commerces.length - 1 ? "border-b border-[#1A1A1A]" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] flex-shrink-0 relative">
                  <Image src={c.logo} alt={c.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{c.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{c.type} &middot; {c.address}</div>
                </div>
                {dist !== null && (
                  <span className="text-[11px] font-semibold text-[#D4AF37] flex-shrink-0">
                    {formatDistance(dist)}
                  </span>
                )}
                <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
