"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Commerce } from "@/types/commerce";
import AddressSearch from "@/components/AddressSearch";

const LOGO_OPTIONS = [
  { value: "/logos/cafe.svg", label: "Café" },
  { value: "/logos/tech.svg", label: "Tech" },
  { value: "/logos/market.svg", label: "Mercado" },
  { value: "/logos/fashion.svg", label: "Moda" },
  { value: "/logos/pharmacy.svg", label: "Farmacia" },
  { value: "/logos/gym.svg", label: "Gym" },
  { value: "/logos/restaurant.svg", label: "Resto" },
  { value: "/logos/barber.svg", label: "Barbería" },
  { value: "/logos/naturist.svg", label: "Natural" },
];

const EMPTY_FORM = {
  name: "",
  type: "",
  description: "",
  address: "",
  lat: "",
  lng: "",
  logo: "/logos/market.svg",
};

export default function AdminPage() {
  const router = useRouter();
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCommerces = useCallback(async () => {
    const res = await fetch("/api/commerces");
    const data = await res.json();
    setCommerces(data);
  }, []);

  useEffect(() => {
    fetchCommerces();
    const timer = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timer);
  }, [fetchCommerces]);

  function showMsg(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      showMsg("Seleccioná una dirección del buscador", false);
      return;
    }
    setLoading(true);
    const payload = { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) };

    if (editingId) {
      const res = await fetch("/api/commerces", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      if (res.ok) {
        showMsg("Comercio actualizado", true);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(false);
        await fetchCommerces();
      } else showMsg("Error al actualizar", false);
    } else {
      const res = await fetch("/api/commerces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showMsg("Comercio agregado", true);
        setForm(EMPTY_FORM);
        setShowForm(false);
        await fetchCommerces();
      } else showMsg("Error al agregar", false);
    }
    setLoading(false);
  }

  function handleEdit(c: Commerce) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      type: c.type,
      description: c.description,
      address: c.address,
      lat: c.lat.toString(),
      lng: c.lng.toString(),
      logo: c.logo,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este comercio?")) return;
    const res = await fetch(`/api/commerces?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("Comercio eliminado", true);
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      await fetchCommerces();
    } else showMsg("Error al eliminar", false);
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  const filtered = commerces.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const typeCount = new Map<string, number>();
  commerces.forEach((c) => typeCount.set(c.type, (typeCount.get(c.type) || 0) + 1));
  const topTypes = [...typeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* ── Welcome Splash ── */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-[#080808] flex items-center justify-center animate-fade-out">
          <div className="text-center">
            <img
              src="/goldaxis-logo.png"
              alt="GoldAxis"
              className="w-24 h-24 mx-auto mb-5 object-contain animate-pulse"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] bg-clip-text text-transparent">
              Bienvenido
            </h1>
            <p className="text-gray-600 text-sm mt-1">Panel de administración</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080808]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-9 h-9 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] bg-clip-text text-transparent">
                GoldAxis
              </h1>
              <p className="text-[10px] text-gray-600 -mt-0.5">Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-xs text-gray-500 hover:text-[#D4AF37] transition-all px-3 py-2 rounded-lg hover:bg-[#D4AF37]/5 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0020 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Mapa
            </a>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-400 transition-all px-3 py-2 rounded-lg hover:bg-red-400/5 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Toast ── */}
      {msg && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-xs font-medium shadow-2xl backdrop-blur-sm flex items-center gap-2 ${
            msg.ok
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {msg.ok ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {msg.text}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-2xl p-4">
            <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-widest font-medium">Total</p>
            <p className="text-2xl font-bold text-[#D4AF37] mt-1">{commerces.length}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">comercios activos</p>
          </div>
          {topTypes.map(([type, count]) => (
            <div key={type} className="bg-[#111] border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium truncate">{type}</p>
              <p className="text-2xl font-bold text-white mt-1">{count}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">registrados</p>
            </div>
          ))}
        </div>

        {/* ── Action Bar ── */}
        <div className="flex items-center gap-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-sm font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo comercio
            </button>
          )}
          <div className="flex-1" />
          <div className="relative w-full max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 bg-[#111] border border-white/5 rounded-xl text-white text-sm placeholder-gray-600 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none"
            />
          </div>
        </div>

        {/* ── Form (collapsible) ── */}
        {showForm && (
          <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${editingId ? "bg-amber-400" : "bg-emerald-400"}`} />
                <h2 className="text-sm font-semibold text-white">
                  {editingId ? "Editando comercio" : "Nuevo comercio"}
                </h2>
              </div>
              <button onClick={handleCancel} className="text-gray-600 hover:text-gray-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Nombre del comercio</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: Café Crypto Bello"
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Categoría</label>
                  <input
                    type="text"
                    required
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    placeholder="Ej: Cafetería, Restaurante..."
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="¿Qué ofrece este comercio? ¿Algún beneficio especial con token?"
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none resize-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Dirección</label>
                <AddressSearch
                  value={form.address}
                  onSelect={(address, lat, lng) =>
                    setForm((f) => ({ ...f, address, lat: lat.toString(), lng: lng.toString() }))
                  }
                />
                {form.lat && form.lng && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-[11px] text-gray-500">
                      Coordenadas: <span className="text-gray-400 font-mono">{parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Ícono</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {LOGO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logo: opt.value }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        form.logo === opt.value
                          ? "border-[#D4AF37]/50 bg-[#D4AF37]/5 shadow-lg shadow-[#D4AF37]/5"
                          : "border-white/5 bg-[#0A0A0A] hover:border-white/10"
                      }`}
                    >
                      <div className="w-8 h-8 relative">
                        <Image src={opt.value} alt={opt.label} fill className="object-cover" />
                      </div>
                      <span className={`text-[10px] font-medium ${form.logo === opt.value ? "text-[#D4AF37]" : "text-gray-600"}`}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all disabled:opacity-50 text-sm shadow-lg shadow-[#D4AF37]/10"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Guardando...
                    </span>
                  ) : editingId ? (
                    "Guardar cambios"
                  ) : (
                    "Agregar comercio"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── Commerce List ── */}
        <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Comercios {search && `· "${search}"`}
            </h3>
            <span className="text-[11px] text-gray-600">{filtered.length} resultados</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">No hay comercios</p>
              <p className="text-gray-700 text-xs mt-1">Agregá el primero con el botón de arriba</p>
            </div>
          ) : (
            <div>
              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  className={`group px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all ${
                    i < filtered.length - 1 ? "border-b border-white/[0.03]" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 flex-shrink-0 relative">
                    <Image src={c.logo} alt={c.name} fill className="object-cover p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm truncate">{c.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-medium text-[#D4AF37]/70 bg-[#D4AF37]/5 rounded-full border border-[#D4AF37]/10 flex-shrink-0">
                        {c.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 truncate mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {c.address}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
