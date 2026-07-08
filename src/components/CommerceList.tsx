"use client";

import { useRef } from "react";
import Image from "next/image";
import { Commerce } from "@/types/commerce";
import { formatDistance } from "@/lib/geo";
import { Lang, t } from "@/lib/translations";

interface Props {
  commerces: Commerce[];
  getDistance: (c: Commerce) => number | null;
  onSelect: (c: Commerce) => void;
  lang: Lang;
}

export default function CommerceList({
  commerces,
  getDistance,
  onSelect,
  lang,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (commerces.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[900] pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
      {/* Count pill */}
      <div className="flex justify-center mb-2">
        <div className="bg-[#141414]/90 backdrop-blur-sm border border-[#2A2A2A] px-4 py-1.5 rounded-full text-[11px] font-semibold text-[#D4AF37]">
          {commerces.length} {t("nearbyCommerces", lang)}
        </div>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {commerces.map((c) => {
          const dist = getDistance(c);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="snap-start flex-shrink-0 w-[200px] bg-[#141414]/95 backdrop-blur-sm border border-[#2A2A2A] rounded-2xl overflow-hidden active:scale-[0.97] transition-transform shadow-lg text-left"
            >
              {/* Image */}
              <div className="relative w-full h-24 bg-[#0A0A0A]">
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-12 h-12">
                      <Image src={c.logo} alt={c.name} fill className="object-contain" />
                    </div>
                  </div>
                )}
                {dist !== null && (
                  <div className="absolute top-2 right-2 bg-[#0A0A0A]/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-[#D4AF37]">
                    {formatDistance(dist)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-0.5">
                <h3 className="text-white text-sm font-semibold truncate">{c.name}</h3>
                <p className="text-gray-500 text-[11px] truncate">{c.type}</p>
              </div>
            </button>
          );
        })}

        {/* End spacer */}
        <div className="flex-shrink-0 w-1" />
      </div>
    </div>
  );
}
