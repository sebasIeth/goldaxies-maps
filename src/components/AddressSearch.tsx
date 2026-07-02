"use client";

import { useState, useRef, useEffect } from "react";
import { Lang, t } from "@/lib/translations";
import { PROVINCES } from "@/lib/provinces";

export const COUNTRIES = [
  { code: "us", name: "United States", flag: "🇺🇸", dial: "+1" },
  { code: "ar", name: "Argentina", flag: "🇦🇷", dial: "+54" },
  { code: "bo", name: "Bolivia", flag: "🇧🇴", dial: "+591" },
  { code: "br", name: "Brasil", flag: "🇧🇷", dial: "+55" },
  { code: "cl", name: "Chile", flag: "🇨🇱", dial: "+56" },
  { code: "co", name: "Colombia", flag: "🇨🇴", dial: "+57" },
  { code: "cr", name: "Costa Rica", flag: "🇨🇷", dial: "+506" },
  { code: "cu", name: "Cuba", flag: "🇨🇺", dial: "+53" },
  { code: "do", name: "Rep. Dominicana", flag: "🇩🇴", dial: "+1" },
  { code: "ec", name: "Ecuador", flag: "🇪🇨", dial: "+593" },
  { code: "sv", name: "El Salvador", flag: "🇸🇻", dial: "+503" },
  { code: "gt", name: "Guatemala", flag: "🇬🇹", dial: "+502" },
  { code: "hn", name: "Honduras", flag: "🇭🇳", dial: "+504" },
  { code: "mx", name: "Mexico", flag: "🇲🇽", dial: "+52" },
  { code: "ni", name: "Nicaragua", flag: "🇳🇮", dial: "+505" },
  { code: "pa", name: "Panama", flag: "🇵🇦", dial: "+507" },
  { code: "py", name: "Paraguay", flag: "🇵🇾", dial: "+595" },
  { code: "pe", name: "Peru", flag: "🇵🇪", dial: "+51" },
  { code: "pr", name: "Puerto Rico", flag: "🇵🇷", dial: "+1" },
  { code: "uy", name: "Uruguay", flag: "🇺🇾", dial: "+598" },
  { code: "ve", name: "Venezuela", flag: "🇻🇪", dial: "+58" },
];

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface GeoOption {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onSelect: (address: string, lat: number, lng: number) => void;
  showCountrySelect?: boolean;
  cascading?: boolean;
  onCountryChange?: (dialCode: string) => void;
  lang?: Lang;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 text-[#D4AF37] animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}

export default function AddressSearch({ value, onSelect, showCountrySelect = false, cascading = false, onCountryChange, lang = "es" }: Props) {
  const [country, setCountry] = useState("us");
  const [countryOpen, setCountryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // Cascading selects state (public map)
  const [provinces, setProvinces] = useState<GeoOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const provinceRef = useRef<HTMLDivElement>(null);

  // Text search state (admin)
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (cascading) loadProvinces(country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) setProvinceOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  function loadProvinces(countryCode: string) {
    setProvinces(PROVINCES[countryCode] || []);
    setSelectedProvince(null);
    setLoadingProvinces(false);
  }

  function handleCountrySelect(code: string) {
    setCountry(code);
    setCountryOpen(false);
    const c = COUNTRIES.find((c) => c.code === code);
    if (c && onCountryChange) onCountryChange(c.dial);
    if (cascading) {
      loadProvinces(code);
    }
    // Reset text search for admin
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleProvinceSelect(prov: GeoOption) {
    setSelectedProvince(prov.name);
    setProvinceOpen(false);
    const addr = `${prov.name}, ${selectedCountry?.name}`;
    onSelect(addr, prov.lat, prov.lng);
  }

  // Admin text search handlers
  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const codes = showCountrySelect ? country : "ar,bo,br,cl,co,cr,cu,do,ec,sv,gt,hn,mx,ni,pa,py,pe,pr,uy,ve";
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({ q: val, format: "json", addressdetails: "1", limit: "5", countrycodes: codes }),
          { headers: { "Accept-Language": "es" } }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
  }

  function handleTextSelect(r: NominatimResult) {
    const shortAddress = r.display_name.split(",").slice(0, 3).join(",").trim();
    setQuery(shortAddress);
    setOpen(false);
    setResults([]);
    onSelect(shortAddress, parseFloat(r.lat), parseFloat(r.lon));
  }

  const dropdownBtnClass = "w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-sm flex items-center gap-3 transition-all hover:border-[#3A3A3A] active:border-[#D4AF37]/30";
  const dropdownListClass = "absolute top-full left-0 right-0 mt-1 bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50 max-h-[240px] overflow-y-auto";

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Country dropdown (shared) */}
      {showCountrySelect && (
        <div ref={countryRef} className="relative">
          <button type="button" onClick={() => setCountryOpen((v) => !v)} className={`${dropdownBtnClass} text-white`}>
            <span className="text-lg leading-none">{selectedCountry?.flag}</span>
            <span className="flex-1 text-left">{selectedCountry?.name}</span>
            <ChevronIcon open={countryOpen} />
          </button>
          {countryOpen && (
            <div className={dropdownListClass}>
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-[#1A1A1A] last:border-b-0 ${
                    c.code === country ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-white hover:bg-[#1A1A1A] active:bg-[#1A1A1A]"
                  }`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="text-sm flex-1">{c.name}</span>
                  {c.code === country && (
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cascading selects for public map */}
      {cascading && (
        <>
          {/* Province / State */}
          <div ref={provinceRef} className="relative">
            <button
              type="button"
              onClick={() => provinces.length > 0 && setProvinceOpen((v) => !v)}
              disabled={provinces.length === 0 && !loadingProvinces}
              className={`${dropdownBtnClass} ${selectedProvince ? "text-white" : "text-gray-500"} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="flex-1 text-left">
                {loadingProvinces ? t("loadingProvinces", lang) : selectedProvince || t("selectProvince", lang)}
              </span>
              {loadingProvinces ? <Spinner /> : <ChevronIcon open={provinceOpen} />}
            </button>
            {provinceOpen && (
              <div className={dropdownListClass}>
                {provinces.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleProvinceSelect(p)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-[#1A1A1A] last:border-b-0 ${
                      p.name === selectedProvince ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-white hover:bg-[#1A1A1A] active:bg-[#1A1A1A]"
                    }`}
                  >
                    <span className="text-sm flex-1">{p.name}</span>
                    {p.name === selectedProvince && (
                      <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </>
      )}

      {/* Text search (admin or non-cascading mode) */}
      {!cascading && (
        <>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder={t("searchAddress", lang)}
              className="w-full pl-9 pr-10 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-gray-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50 max-h-[260px] overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => handleTextSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-[#1A1A1A] active:bg-[#1A1A1A] transition-colors border-b border-[#1A1A1A] last:border-b-0 flex items-start gap-2.5"
                >
                  <svg className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{r.display_name.split(",").slice(0, 2).join(",")}</p>
                    <p className="text-gray-500 text-[11px] truncate mt-0.5">{r.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
