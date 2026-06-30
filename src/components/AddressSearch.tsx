"use client";

import { useState, useRef, useEffect } from "react";

const COUNTRIES = [
  { code: "ar", name: "Argentina", flag: "🇦🇷" },
  { code: "bo", name: "Bolivia", flag: "🇧🇴" },
  { code: "br", name: "Brasil", flag: "🇧🇷" },
  { code: "cl", name: "Chile", flag: "🇨🇱" },
  { code: "co", name: "Colombia", flag: "🇨🇴" },
  { code: "cr", name: "Costa Rica", flag: "🇨🇷" },
  { code: "cu", name: "Cuba", flag: "🇨🇺" },
  { code: "do", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "ec", name: "Ecuador", flag: "🇪🇨" },
  { code: "sv", name: "El Salvador", flag: "🇸🇻" },
  { code: "gt", name: "Guatemala", flag: "🇬🇹" },
  { code: "hn", name: "Honduras", flag: "🇭🇳" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "ni", name: "Nicaragua", flag: "🇳🇮" },
  { code: "pa", name: "Panama", flag: "🇵🇦" },
  { code: "py", name: "Paraguay", flag: "🇵🇾" },
  { code: "pe", name: "Peru", flag: "🇵🇪" },
  { code: "pr", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "uy", name: "Uruguay", flag: "🇺🇾" },
  { code: "ve", name: "Venezuela", flag: "🇻🇪" },
];

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  value: string;
  onSelect: (address: string, lat: number, lng: number) => void;
  showCountrySelect?: boolean;
}

export default function AddressSearch({ value, onSelect, showCountrySelect = false }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("ar");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(val: string) {
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const codes = showCountrySelect
          ? country
          : "ar,bo,br,cl,co,cr,cu,do,ec,sv,gt,hn,mx,ni,pa,py,pe,pr,uy,ve";
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: val,
              format: "json",
              addressdetails: "1",
              limit: "5",
              countrycodes: codes,
            }),
          {
            headers: { "Accept-Language": "es" },
          }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);
  }

  function handleSelect(r: NominatimResult) {
    const shortAddress =
      r.display_name.split(",").slice(0, 3).join(",").trim();
    setQuery(shortAddress);
    setOpen(false);
    setResults([]);
    onSelect(shortAddress, parseFloat(r.lat), parseFloat(r.lon));
  }

  function handleCountryChange(code: string) {
    setCountry(code);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  return (
    <div ref={containerRef} className="relative space-y-2">
      {showCountrySelect && (
        <div className="relative">
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none appearance-none cursor-pointer"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag}  {c.name}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={showCountrySelect && selectedCountry ? `Search in ${selectedCountry.name}...` : "Search address..."}
          className="w-full pl-9 pr-10 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-gray-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
        />
        {loading && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-[#252525] transition-colors border-b border-[#222] last:border-b-0 flex items-start gap-2.5"
            >
              <svg
                className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="min-w-0">
                <p className="text-white text-sm truncate">
                  {r.display_name.split(",").slice(0, 2).join(",")}
                </p>
                <p className="text-gray-500 text-[11px] truncate">
                  {r.display_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
