"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Commerce } from "@/types/commerce";
import AddressSearch from "@/components/AddressSearch";

const CATEGORIES = [
  { value: "Cafe", logo: "/logos/cafe.svg", label: { en: "Cafe", es: "Cafe" } },
  { value: "Restaurant", logo: "/logos/restaurant.svg", label: { en: "Restaurant", es: "Restaurante" } },
  { value: "Market", logo: "/logos/market.svg", label: { en: "Market", es: "Mercado" } },
  { value: "Tech", logo: "/logos/tech.svg", label: { en: "Tech", es: "Tecnologia" } },
  { value: "Fashion", logo: "/logos/fashion.svg", label: { en: "Fashion", es: "Moda" } },
  { value: "Pharmacy", logo: "/logos/pharmacy.svg", label: { en: "Pharmacy", es: "Farmacia" } },
  { value: "Gym", logo: "/logos/gym.svg", label: { en: "Gym", es: "Gimnasio" } },
  { value: "Barber", logo: "/logos/barber.svg", label: { en: "Barber", es: "Barberia" } },
  { value: "Natural", logo: "/logos/naturist.svg", label: { en: "Natural", es: "Natural" } },
  { value: "Beauty", logo: "/logos/beauty.svg", label: { en: "Beauty", es: "Belleza" } },
  { value: "Services", logo: "/logos/services.svg", label: { en: "Services", es: "Servicios" } },
  { value: "Education", logo: "/logos/education.svg", label: { en: "Education", es: "Educacion" } },
  { value: "Real Estate", logo: "/logos/realestate.svg", label: { en: "Real Estate", es: "Inmobiliaria" } },
  { value: "Other", logo: "/logos/other.svg", label: { en: "Other", es: "Otro" } },
];

const t = {
  en: {
    welcome: "Welcome",
    adminPanel: "Admin Panel",
    map: "Map",
    logout: "Logout",
    total: "Total",
    activeCommerces: "active commerces",
    registered: "registered",
    newCommerce: "New commerce",
    search: "Search...",
    editing: "Editing commerce",
    newCommerceTitle: "New commerce",
    commerceName: "Commerce name",
    commerceNamePlaceholder: "e.g. Crypto Cafe",
    category: "Category",
    selectCategory: "Select a category...",
    description: "Description",
    descriptionPlaceholder: "What does this commerce offer? Any token benefits?",
    address: "Address",
    coordinates: "Coordinates",
    icon: "Icon",
    saving: "Saving...",
    saveChanges: "Save changes",
    addCommerce: "Add commerce",
    cancel: "Cancel",
    commerces: "Commerces",
    results: "results",
    noCommerces: "No commerces",
    addFirst: "Add the first one with the button above",
    selectAddress: "Select an address from the search",
    commerceUpdated: "Commerce updated",
    commerceAdded: "Commerce added",
    commerceDeleted: "Commerce deleted",
    errorUpdating: "Error updating",
    errorAdding: "Error adding",
    errorDeleting: "Error deleting",
    deleteConfirm: "Delete this commerce?",
    users: "Users",
    addUser: "Add user",
    name: "Name",
    email: "Email",
    password: "Password",
    role: "Role",
    creating: "Creating...",
    createUser: "Create user",
    userCreated: "User created",
    errorCreating: "Error creating user",
    deleteUser: "Delete this user?",
    userDeleted: "User deleted",
    superadmin: "Super Admin",
    admin: "Admin",
    has2fa: "2FA",
    noUsers: "No users",
  },
  es: {
    welcome: "Bienvenido",
    adminPanel: "Panel de administracion",
    map: "Mapa",
    logout: "Salir",
    total: "Total",
    activeCommerces: "comercios activos",
    registered: "registrados",
    newCommerce: "Nuevo comercio",
    search: "Buscar...",
    editing: "Editando comercio",
    newCommerceTitle: "Nuevo comercio",
    commerceName: "Nombre del comercio",
    commerceNamePlaceholder: "Ej: Cafe Crypto",
    category: "Categoria",
    selectCategory: "Selecciona una categoria...",
    description: "Descripcion",
    descriptionPlaceholder: "Que ofrece este comercio? Algun beneficio con token?",
    address: "Direccion",
    coordinates: "Coordenadas",
    icon: "Icono",
    saving: "Guardando...",
    saveChanges: "Guardar cambios",
    addCommerce: "Agregar comercio",
    cancel: "Cancelar",
    commerces: "Comercios",
    results: "resultados",
    noCommerces: "No hay comercios",
    addFirst: "Agrega el primero con el boton de arriba",
    selectAddress: "Selecciona una direccion del buscador",
    commerceUpdated: "Comercio actualizado",
    commerceAdded: "Comercio agregado",
    commerceDeleted: "Comercio eliminado",
    errorUpdating: "Error al actualizar",
    errorAdding: "Error al agregar",
    errorDeleting: "Error al eliminar",
    deleteConfirm: "Eliminar este comercio?",
    users: "Usuarios",
    addUser: "Agregar usuario",
    name: "Nombre",
    email: "Email",
    password: "Contrasena",
    role: "Rol",
    creating: "Creando...",
    createUser: "Crear usuario",
    userCreated: "Usuario creado",
    errorCreating: "Error al crear usuario",
    deleteUser: "Eliminar este usuario?",
    userDeleted: "Usuario eliminado",
    superadmin: "Super Admin",
    admin: "Admin",
    has2fa: "2FA",
    noUsers: "No hay usuarios",
  },
};

type Lang = "en" | "es";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  has2FA: boolean;
}

const EMPTY_FORM = {
  name: "",
  type: "Cafe",
  description: "",
  address: "",
  lat: "",
  lng: "",
  logo: "/logos/cafe.svg",
};

const EMPTY_USER_FORM = { name: "", email: "", password: "" };

export default function AdminPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [userLoading, setUserLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"commerces" | "users">("commerces");

  const l = t[lang];

  const fetchCommerces = useCallback(async () => {
    const res = await fetch("/api/commerces");
    const data = await res.json();
    setCommerces(data);
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setIsSuperAdmin(data.role === "superadmin");
      }
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchCommerces();
    fetchSession();
    const saved = localStorage.getItem("goldaxis-lang");
    if (saved === "es" || saved === "en") setLang(saved);
    const timer = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timer);
  }, [fetchCommerces, fetchSession]);

  useEffect(() => {
    if (isSuperAdmin && activeTab === "users") fetchUsers();
  }, [isSuperAdmin, activeTab, fetchUsers]);

  function toggleLang() {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("goldaxis-lang", next);
  }

  function showMsgFn(text: string, ok: boolean) {
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
      showMsgFn(l.selectAddress, false);
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
        showMsgFn(l.commerceUpdated, true);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(false);
        await fetchCommerces();
      } else showMsgFn(l.errorUpdating, false);
    } else {
      const res = await fetch("/api/commerces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showMsgFn(l.commerceAdded, true);
        setForm(EMPTY_FORM);
        setShowForm(false);
        await fetchCommerces();
      } else showMsgFn(l.errorAdding, false);
    }
    setLoading(false);
  }

  function handleEdit(c: Commerce) {
    setEditingId(c.id);
    setForm({
      name: c.name, type: c.type, description: c.description,
      address: c.address, lat: c.lat.toString(), lng: c.lng.toString(), logo: c.logo,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm(l.deleteConfirm)) return;
    const res = await fetch(`/api/commerces?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsgFn(l.commerceDeleted, true);
      if (editingId === id) { setEditingId(null); setForm(EMPTY_FORM); }
      await fetchCommerces();
    } else showMsgFn(l.errorDeleting, false);
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setUserLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    setUserLoading(false);
    if (res.ok) {
      showMsgFn(l.userCreated, true);
      setUserForm(EMPTY_USER_FORM);
      setShowUserForm(false);
      fetchUsers();
    } else {
      const data = await res.json();
      showMsgFn(data.error || l.errorCreating, false);
    }
  }

  async function handleDeleteUser(email: string) {
    if (!confirm(l.deleteUser)) return;
    const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    if (res.ok) {
      showMsgFn(l.userDeleted, true);
      fetchUsers();
    }
  }

  const filtered = commerces.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const typeCount = new Map<string, number>();
  commerces.forEach((c) => typeCount.set(c.type, (typeCount.get(c.type) || 0) + 1));
  const topTypes = [...typeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-[#080808] flex items-center justify-center animate-fade-out">
          <div className="text-center">
            <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-24 h-24 mx-auto mb-5 object-contain animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] bg-clip-text text-transparent">{l.welcome}</h1>
            <p className="text-gray-600 text-sm mt-1">{l.adminPanel}</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080808]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/goldaxis-logo.png" alt="GoldAxis" className="w-9 h-9 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] bg-clip-text text-transparent">GoldAxis</h1>
              <p className="text-[10px] text-gray-600 -mt-0.5">{l.adminPanel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language switch */}
            <button
              onClick={toggleLang}
              className="text-xs text-gray-500 hover:text-[#D4AF37] transition-all px-2.5 py-2 rounded-lg hover:bg-[#D4AF37]/5 font-semibold"
            >
              {lang === "en" ? "ES" : "EN"}
            </button>
            <a href="/" className="text-xs text-gray-500 hover:text-[#D4AF37] transition-all px-3 py-2 rounded-lg hover:bg-[#D4AF37]/5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0020 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {l.map}
            </a>
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition-all px-3 py-2 rounded-lg hover:bg-red-400/5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {l.logout}
            </button>
          </div>
        </div>
      </header>

      {msg && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-xs font-medium shadow-2xl backdrop-blur-sm flex items-center gap-2 ${msg.ok ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
          {msg.ok ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          {msg.text}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-2xl p-4">
            <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-widest font-medium">{l.total}</p>
            <p className="text-2xl font-bold text-[#D4AF37] mt-1">{commerces.length}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{l.activeCommerces}</p>
          </div>
          {topTypes.map(([type, count]) => (
            <div key={type} className="bg-[#111] border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium truncate">{type}</p>
              <p className="text-2xl font-bold text-white mt-1">{count}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">{l.registered}</p>
            </div>
          ))}
        </div>

        {/* Tabs (superadmin sees Users tab) */}
        {isSuperAdmin && (
          <div className="flex gap-1 bg-[#111] border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("commerces")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "commerces" ? "bg-[#D4AF37] text-black" : "text-gray-500 hover:text-white"}`}
            >
              {l.commerces}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "users" ? "bg-[#D4AF37] text-black" : "text-gray-500 hover:text-white"}`}
            >
              {l.users}
            </button>
          </div>
        )}

        {/* ── COMMERCES TAB ── */}
        {activeTab === "commerces" && (
          <>
            <div className="flex items-center gap-3">
              {!showForm && (
                <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-sm font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  {l.newCommerce}
                </button>
              )}
              <div className="flex-1" />
              <div className="relative w-full max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={l.search} className="w-full pl-9 pr-3 py-2 bg-[#111] border border-white/5 rounded-xl text-white text-sm placeholder-gray-600 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none" />
              </div>
            </div>

            {showForm && (
              <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${editingId ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <h2 className="text-sm font-semibold text-white">{editingId ? l.editing : l.newCommerceTitle}</h2>
                  </div>
                  <button onClick={handleCancel} className="text-gray-600 hover:text-gray-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.commerceName}</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={l.commerceNamePlaceholder} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.category}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.value} type="button" onClick={() => setForm((f) => ({ ...f, type: cat.value, logo: cat.logo }))} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.type === cat.value ? "border-[#D4AF37]/50 bg-[#D4AF37]/5 shadow-lg shadow-[#D4AF37]/5" : "border-white/5 bg-[#0A0A0A] hover:border-white/10"}`}>
                          <div className="w-9 h-9 relative"><Image src={cat.logo} alt={cat.label[lang]} fill className="object-contain" /></div>
                          <span className={`text-[10px] font-medium ${form.type === cat.value ? "text-[#D4AF37]" : "text-gray-600"}`}>{cat.label[lang]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.description}</label>
                    <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={l.descriptionPlaceholder} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none resize-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.address}</label>
                    <AddressSearch value={form.address} onSelect={(address, lat, lng) => setForm((f) => ({ ...f, address, lat: lat.toString(), lng: lng.toString() }))} showCountrySelect />
                    {form.lat && form.lng && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <p className="text-[11px] text-gray-500">{l.coordinates}: <span className="text-gray-400 font-mono">{parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}</span></p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all disabled:opacity-50 text-sm shadow-lg shadow-[#D4AF37]/10">
                      {loading ? l.saving : editingId ? l.saveChanges : l.addCommerce}
                    </button>
                    <button type="button" onClick={handleCancel} className="px-6 py-2.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">{l.cancel}</button>
                  </div>
                </form>
              </section>
            )}

            <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{l.commerces} {search && `· "${search}"`}</h3>
                <span className="text-[11px] text-gray-600">{filtered.length} {l.results}</span>
              </div>
              {filtered.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <p className="text-gray-600 text-sm">{l.noCommerces}</p>
                  <p className="text-gray-700 text-xs mt-1">{l.addFirst}</p>
                </div>
              ) : (
                <div>
                  {filtered.map((c, i) => (
                    <div key={c.id} className={`group px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all ${i < filtered.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 flex-shrink-0 relative"><Image src={c.logo} alt={c.name} fill className="object-cover p-1" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm truncate">{c.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-medium text-[#D4AF37]/70 bg-[#D4AF37]/5 rounded-full border border-[#D4AF37]/10 flex-shrink-0">{c.type}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 truncate mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {c.address}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => handleEdit(c)} className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ── USERS TAB (superadmin only) ── */}
        {activeTab === "users" && isSuperAdmin && (
          <>
            <div className="flex items-center gap-3">
              {!showUserForm && (
                <button onClick={() => setShowUserForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-sm font-semibold rounded-xl hover:from-[#E5C04B] hover:to-[#D4AF37] transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  {l.addUser}
                </button>
              )}
            </div>

            {showUserForm && (
              <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">{l.addUser}</h2>
                  </div>
                  <button onClick={() => { setShowUserForm(false); setUserForm(EMPTY_USER_FORM); }} className="text-gray-600 hover:text-gray-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.name}</label>
                      <input type="text" required value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.email}</label>
                      <input type="email" required value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.password}</label>
                      <input type="password" required minLength={8} value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <button type="submit" disabled={userLoading} className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl transition-all disabled:opacity-50 text-sm">
                      {userLoading ? l.creating : l.createUser}
                    </button>
                    <button type="button" onClick={() => { setShowUserForm(false); setUserForm(EMPTY_USER_FORM); }} className="px-6 py-2.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">{l.cancel}</button>
                  </div>
                </form>
              </section>
            )}

            <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{l.users}</h3>
              </div>
              {adminUsers.length === 0 ? (
                <div className="px-5 py-12 text-center"><p className="text-gray-600 text-sm">{l.noUsers}</p></div>
              ) : (
                <div>
                  {adminUsers.map((u, i) => (
                    <div key={u.id} className={`group px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all ${i < adminUsers.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#D4AF37] font-bold text-sm">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{u.name}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border flex-shrink-0 ${u.role === "superadmin" ? "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20" : "text-gray-400 bg-white/5 border-white/10"}`}>
                            {u.role === "superadmin" ? l.superadmin : l.admin}
                          </span>
                          {u.has2FA && <span className="px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20">{l.has2fa}</span>}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">{u.email}</p>
                      </div>
                      {u.role !== "superadmin" && (
                        <button onClick={() => handleDeleteUser(u.email)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
