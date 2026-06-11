"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") === "2fa" ? "2fa" : "login";

  const [step, setStep] = useState<"login" | "2fa" | "setup-2fa">(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qrData, setQrData] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);

    let data;
    try {
      data = await res.json();
    } catch {
      setError("Error de conexión con el servidor. Intentá de nuevo.");
      return;
    }

    if (!res.ok) {
      setError(data.error || "Error del servidor");
      return;
    }

    if (data.needsSetup2FA) {
      await setup2FA();
      return;
    }

    if (data.needs2FA) {
      setStep("2fa");
      return;
    }

    // Nunca debería llegar acá — siempre se requiere 2FA
    setError("Error inesperado en el flujo de autenticación");
  }

  async function setup2FA() {
    const res = await fetch("/api/auth/setup-2fa", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setQrData(data.qrDataUrl);
      setSecret(data.secret);
      setStep("setup-2fa");
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Si es primer setup, usar PUT en setup-2fa; si ya existe, usar verify-2fa
    const url = step === "setup-2fa" ? "/api/auth/setup-2fa" : "/api/auth/verify-2fa";
    const method = step === "setup-2fa" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      setCode("");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-[#D4AF37]">GoldAxis</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@goldaxis.com"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-gray-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-gray-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all disabled:opacity-50 text-sm"
              >
                {loading ? "Verificando..." : "Iniciar sesión"}
              </button>
            </form>
          )}

          {step === "setup-2fa" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#D4AF37]/10 mb-3">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold">Configurar 2FA</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Escaneá este QR con Google Authenticator o Authy
                </p>
              </div>

              {qrData && (
                <div className="flex justify-center">
                  <img src={qrData} alt="QR 2FA" className="w-48 h-48 rounded-xl" />
                </div>
              )}

              {secret && (
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Clave manual</p>
                  <p className="text-[#D4AF37] text-xs font-mono break-all select-all">{secret}</p>
                </div>
              )}

              <form onSubmit={handleVerify2FA} className="space-y-3">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-center text-xl font-mono tracking-[0.5em] placeholder-gray-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? "Verificando..." : "Verificar y entrar"}
                </button>
              </form>
            </div>
          )}

          {step === "2fa" && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#D4AF37]/10 mb-3">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold">Verificación 2FA</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Ingresá el código de tu app de autenticación
                </p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-center text-xl font-mono tracking-[0.5em] placeholder-gray-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
              />

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all disabled:opacity-50 text-sm"
              >
                {loading ? "Verificando..." : "Verificar"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          GoldAxis &middot; Panel seguro
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37]">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
