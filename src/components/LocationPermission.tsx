"use client";

import { useState } from "react";
import AddressSearch from "./AddressSearch";

interface Props {
  onSetLocation: (lat: number, lng: number, address: string) => void;
  onSkip: () => void;
}

export default function LocationPermission({ onSetLocation, onSkip }: Props) {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  function handleSelect(addr: string, lat: number, lng: number) {
    setAddress(addr);
    setCoords({ lat, lng });
  }

  function handleConfirm() {
    if (coords) {
      onSetLocation(coords.lat, coords.lng, address);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0A0A0A]/95 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-14 h-14 mx-auto mb-1 object-contain" />
          <h2 className="text-lg font-bold text-white">Your Location</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Enter your address to see nearby businesses and calculate routes.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Your address
          </label>
          <AddressSearch value={address} onSelect={handleSelect} />
          {coords && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[11px] text-gray-500">
                Location found
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleConfirm}
            disabled={!coords}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirm location
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3 bg-[#1A1A1A] text-gray-400 rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors text-sm"
          >
            Skip for now
          </button>
        </div>

        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-500">Your location is stored locally on your device only</p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-500">We never share your position with third parties</p>
          </div>
        </div>
      </div>
    </div>
  );
}
