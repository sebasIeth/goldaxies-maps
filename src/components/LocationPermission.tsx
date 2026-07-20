"use client";

import { useState } from "react";
import AddressSearch from "./AddressSearch";
import { Lang, t } from "@/lib/translations";

interface Props {
  onSetLocation: (lat: number, lng: number, address: string) => void;
  onSkip: () => void;
  lang: Lang;
  onLangChange?: (lang: Lang) => void;
  isSettings?: boolean;
}

export default function LocationPermission({ onSetLocation, onSkip, lang, onLangChange, isSettings = false }: Props) {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  function handleSelect(addr: string, lat: number, lng: number) {
    setAddress(addr);
    setCoords({ lat, lng });
  }

  function handleReset() {
    setAddress("");
    setCoords(null);
  }

  function handleConfirm() {
    if (coords) {
      onSetLocation(coords.lat, coords.lng, address);
    }
  }

  function toggleLang() {
    if (onLangChange) {
      onLangChange(lang === "es" ? "en" : "es");
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0A0A0A]/95 flex items-end sm:items-center justify-center p-4 safe-bottom">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-14 h-14 mx-auto mb-1 object-contain" />
          <h2 className="text-lg font-bold text-white">
            {isSettings ? t("settings", lang) : t("yourLocation", lang)}
          </h2>
          {!isSettings && (
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              {t("locationDesc", lang)}
            </p>
          )}
        </div>

        {/* Language setting */}
        {isSettings && onLangChange && (
          <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-sm text-white">{t("language", lang)}</span>
            </div>
            <button
              onClick={toggleLang}
              className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded-lg text-xs font-bold text-[#D4AF37] active:bg-[#D4AF37]/10 transition-all"
            >
              {lang === "es" ? "ES 🇪🇸" : "EN 🇺🇸"}
            </button>
          </div>
        )}

        {/* Location section */}
        {isSettings && (
          <div className="flex items-center gap-2 pt-1">
            <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-white">{t("changeLocation", lang)}</span>
          </div>
        )}

        <AddressSearch value={address} onSelect={handleSelect} onReset={handleReset} showCountrySelect cascading lang={lang} />

        <div className="space-y-2">
          <button
            onClick={handleConfirm}
            disabled={!coords}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl active:scale-[0.98] transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("confirmLocation", lang)}
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3.5 bg-[#1A1A1A] text-gray-400 rounded-xl border border-[#2A2A2A] active:border-[#3A3A3A] transition-colors text-sm"
          >
            {isSettings
              ? (lang === "es" ? "Cerrar" : "Close")
              : t("skipForNow", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
