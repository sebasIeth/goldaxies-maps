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
    <div className="absolute bottom-0 left-0 right-0 z-[900] pb-[max(env(safe-area-inset-bottom,8px),8px)]">
      {/* Count pill */}
      <div className="flex justify-center mb-1.5">
        <div className="bg-[#141414]/90 backdrop-blur-sm border border-[#2A2A2A] px-3 py-1 rounded-full text-[11px] font-semibold text-[#D4AF37]">
          {commerces.length} {t("nearbyCommerces", lang)}
        </div>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto px-3 snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {commerces.map((c) => {
          const dist = getDistance(c);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="snap-start flex-shrink-0 w-[150px] bg-[#141414]/95 backdrop-blur-sm border border-[#2A2A2A] rounded-xl overflow-hidden active:scale-[0.97] transition-transform shadow-lg text-left"
            >
              {/* Image */}
              <div className="relative w-full h-16 bg-[#0A0A0A]">
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-8 h-8">
                      <Image src={c.logo} alt={c.name} fill className="object-contain" />
                    </div>
                  </div>
                )}
                {dist !== null && (
                  <div className="absolute top-1 right-1 bg-[#0A0A0A]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-bold text-[#D4AF37]">
                    {formatDistance(dist)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-2 py-1.5">
                <h3 className="text-white text-xs font-semibold truncate">{c.name}</h3>
                <p className="text-gray-500 text-[10px] truncate">{c.type}</p>
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
