"use client";

interface Props {
  onAllow: () => void;
  onDeny: () => void;
}

export default function LocationPermission({ onAllow, onDeny }: Props) {
  return (
    <div className="fixed inset-0 z-[2000] bg-[#0A0A0A]/95 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-14 h-14 mx-auto mb-1 object-contain" />
          <h2 className="text-lg font-bold text-white">Ubicación</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            GoldAxis necesita tu ubicación para mostrarte los comercios más cercanos
            y calcular rutas hacia ellos.
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-500">Tu ubicación solo se usa localmente en tu dispositivo</p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-500">No almacenamos ni compartimos tu posición con terceros</p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-500">Podés revocar el permiso en cualquier momento desde tu navegador</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onAllow}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all text-sm"
          >
            Permitir ubicación
          </button>
          <button
            onClick={onDeny}
            className="w-full py-3 bg-[#1A1A1A] text-gray-400 rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors text-sm"
          >
            Continuar sin ubicación
          </button>
        </div>
      </div>
    </div>
  );
}
