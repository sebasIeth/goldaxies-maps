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
    image: "Commerce image",
    uploadImage: "Upload image",
    changeImage: "Change image",
    uploading: "Uploading...",
    imageUploaded: "Image uploaded",
    imageDimensions: "Recommended: 800×400px (2:1 landscape)",
    preview: "Preview",
    previewTitle: "User preview",
    orUseCategory: "Or use a category icon:",
    phone: "Phone number",
    phonePlaceholder: "e.g. +1 555 123 4567",
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
    promoteConfirm: "Promote this user to Super Admin?",
    demoteConfirm: "Demote this user to Admin?",
    roleUpdated: "Role updated",
    confirm: "Confirm",
    editUser: "Edit user",
    newPassword: "New password",
    newPasswordPlaceholder: "Leave empty to keep current",
    reset2fa: "Reset 2FA",
    reset2faConfirm: "Reset 2FA for this user? They will need to set it up again.",
    reset2faDone: "2FA reset",
    userUpdated: "User updated",
    save: "Save",
    you: "You",
    lastLogin: "Last login",
    never: "Never",
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
    image: "Imagen del comercio",
    uploadImage: "Subir imagen",
    changeImage: "Cambiar imagen",
    uploading: "Subiendo...",
    imageUploaded: "Imagen subida",
    imageDimensions: "Recomendado: 800×400px (2:1 horizontal)",
    preview: "Vista previa",
    previewTitle: "Vista del usuario",
    orUseCategory: "O usar icono de categoria:",
    phone: "Numero de telefono",
    phonePlaceholder: "Ej: +57 300 123 4567",
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
    promoteConfirm: "Promover este usuario a Super Admin?",
    demoteConfirm: "Bajar este usuario a Admin?",
    roleUpdated: "Rol actualizado",
    confirm: "Confirmar",
    editUser: "Editar usuario",
    newPassword: "Nueva contrasena",
    newPasswordPlaceholder: "Dejar vacio para mantener la actual",
    reset2fa: "Resetear 2FA",
    reset2faConfirm: "Resetear 2FA de este usuario? Tendra que configurarlo de nuevo.",
    reset2faDone: "2FA reseteado",
    userUpdated: "Usuario actualizado",
    save: "Guardar",
    you: "Tu",
    lastLogin: "Ultimo acceso",
    never: "Nunca",
  },
};

type Lang = "en" | "es";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  has2FA: boolean;
  lastLogin: string | null;
}

function formatTimeAgo(dateStr: string, lang: Lang): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "es" ? "Justo ahora" : "Just now";
  if (mins < 60) return lang === "es" ? `Hace ${mins}min` : `${mins}min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === "es" ? `Hace ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return lang === "es" ? `Hace ${days}d` : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(lang === "es" ? "es" : "en", { day: "numeric", month: "short" });
}

const EMPTY_FORM = {
  name: "",
  type: "Cafe",
  description: "",
  phone: "",
  address: "",
  lat: "",
  lng: "",
  logo: "/logos/cafe.svg",
  image: "",
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
  const [sessionEmail, setSessionEmail] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [userLoading, setUserLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"commerces" | "users">("commerces");
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void; variant?: "danger" | "warning" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: "", password: "" });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const l = t[lang];

  function askConfirm(message: string, onConfirm: () => void, variant: "danger" | "warning" = "danger") {
    setConfirmModal({ message, onConfirm, variant });
  }

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
        setSessionEmail(data.email);
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
      name: c.name, type: c.type, description: c.description, phone: c.phone || "",
      address: c.address, lat: c.lat.toString(), lng: c.lng.toString(), logo: c.logo,
      image: c.image || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    askConfirm(l.deleteConfirm, async () => {
      const res = await fetch(`/api/commerces?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsgFn(l.commerceDeleted, true);
        if (editingId === id) { setEditingId(null); setForm(EMPTY_FORM); }
        await fetchCommerces();
      } else showMsgFn(l.errorDeleting, false);
    });
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((f) => ({ ...f, image: url, logo: url }));
        showMsgFn(l.imageUploaded, true);
      } else {
        const { error } = await res.json();
        showMsgFn(error || "Upload failed", false);
      }
    } catch {
      showMsgFn("Upload failed", false);
    }
    setUploadingImage(false);
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

  function handleDeleteUser(email: string) {
    askConfirm(l.deleteUser, async () => {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, { method: "DELETE" });
      if (res.ok) {
        showMsgFn(l.userDeleted, true);
        fetchUsers();
      }
    });
  }

  function handleToggleRole(email: string, currentRole: string) {
    const newRole = currentRole === "superadmin" ? "admin" : "superadmin";
    const message = newRole === "superadmin" ? l.promoteConfirm : l.demoteConfirm;
    askConfirm(message, async () => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });
      if (res.ok) {
        showMsgFn(l.roleUpdated, true);
        fetchUsers();
      }
    }, "warning");
  }

  function openEditUser(u: AdminUser) {
    setEditingUser(u);
    setEditUserForm({ name: u.name, password: "" });
    setShowEditPassword(false);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserLoading(true);
    const body: Record<string, string> = { email: editingUser.email };
    if (editUserForm.name && editUserForm.name !== editingUser.name) body.name = editUserForm.name;
    if (editUserForm.password) body.password = editUserForm.password;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditUserLoading(false);
    if (res.ok) {
      showMsgFn(l.userUpdated, true);
      setEditingUser(null);
      fetchUsers();
    } else {
      const data = await res.json();
      showMsgFn(data.error || l.errorUpdating, false);
    }
  }

  function handleReset2FA(email: string) {
    askConfirm(l.reset2faConfirm, async () => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reset2FA: true }),
      });
      if (res.ok) {
        showMsgFn(l.reset2faDone, true);
        fetchUsers();
      }
    }, "warning");
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

      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-xs space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.variant === "warning" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                {confirmModal.variant === "warning" ? (
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                )}
              </div>
            </div>
            <p className="text-white text-sm text-center font-medium">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-2.5 bg-[#1A1A1A] text-gray-400 rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors text-sm font-medium">{l.cancel}</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${confirmModal.variant === "warning" ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-red-500 hover:bg-red-400 text-white"}`}>{l.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {l.previewTitle}
              </span>
              <button onClick={() => setShowPreview(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors text-xs">✕</button>
            </div>
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
              {form.image && (
                <div className="relative w-full h-36">
                  <Image src={form.image} alt={form.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                </div>
              )}
              <div className={`flex items-center gap-3 px-4 pb-2 ${form.image ? "-mt-8 relative z-10" : "pt-4"}`}>
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] flex-shrink-0 relative">
                  <Image src={form.image || (CATEGORIES.find((c) => c.value === form.type)?.logo || "/logos/cafe.svg")} alt={form.name} fill className={form.image ? "object-cover" : "object-cover p-1"} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{form.name || "Commerce name"}</h3>
                  <span className="text-xs text-[#D4AF37] font-medium">{form.type}</span>
                </div>
              </div>
              {form.description && <div className="px-4 pb-2"><p className="text-gray-400 text-xs leading-relaxed">{form.description}</p></div>}
              {form.phone && (
                <div className="px-4 pb-2 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>{form.phone}</span>
                </div>
              )}
              {form.address && (
                <div className="px-4 pb-2 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="truncate">{form.address}</span>
                </div>
              )}
              <div className="px-4 pb-4 pt-1">
                <div className="w-full text-center py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl text-sm">
                  {lang === "es" ? "Cómo llegar" : "Get directions"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {l.editUser}
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                  <span className="text-[#D4AF37] font-bold text-sm">{editingUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{editingUser.name}</p>
                  <p className="text-gray-500 text-[11px]">{editingUser.email}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.name}</label>
                <input type="text" required value={editUserForm.name} onChange={(e) => setEditUserForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm focus:ring-1 focus:ring-[#D4AF37]/50 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.newPassword}</label>
                <div className="relative">
                  <input type={showEditPassword ? "text" : "password"} minLength={8} value={editUserForm.password} onChange={(e) => setEditUserForm((f) => ({ ...f, password: e.target.value }))} placeholder={l.newPasswordPlaceholder} className="w-full px-4 py-2.5 pr-10 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none" />
                  <button type="button" onClick={() => setShowEditPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors">
                    {showEditPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 bg-[#1A1A1A] text-gray-400 rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors text-sm font-medium">{l.cancel}</button>
                <button type="submit" disabled={editUserLoading} className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold rounded-xl transition-all disabled:opacity-50 text-sm">{editUserLoading ? l.saving : l.save}</button>
              </div>
            </form>
          </div>
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
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.image}</label>
                    {form.image ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D4AF37]/30 relative flex-shrink-0">
                          <Image src={form.image} alt="Commerce" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="px-3 py-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg text-xs text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                            {l.changeImage}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                          </label>
                          <button type="button" onClick={() => setShowPreview(true)} className="text-[10px] text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors text-left flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {l.preview}
                          </button>
                          <button type="button" onClick={() => setForm((f) => ({ ...f, image: "", logo: CATEGORIES.find((c) => c.value === f.type)?.logo || "/logos/cafe.svg" }))} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors text-left">
                            {lang === "es" ? "Quitar imagen" : "Remove image"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center gap-2 p-4 border border-dashed rounded-xl cursor-pointer transition-all ${uploadingImage ? "border-[#D4AF37]/30 bg-[#D4AF37]/5" : "border-white/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5"}`}>
                        {uploadingImage ? (
                          <svg className="w-6 h-6 text-[#D4AF37] animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                        <span className="text-xs text-gray-500">{uploadingImage ? l.uploading : l.uploadImage}</span>
                        <span className="text-[10px] text-gray-700">{l.imageDimensions}</span>
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                      </label>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{form.image ? l.category : l.orUseCategory}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.value} type="button" onClick={() => setForm((f) => ({ ...f, type: cat.value, logo: f.image || cat.logo }))} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.type === cat.value ? "border-[#D4AF37]/50 bg-[#D4AF37]/5 shadow-lg shadow-[#D4AF37]/5" : "border-white/5 bg-[#0A0A0A] hover:border-white/10"}`}>
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
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.phone}</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={l.phonePlaceholder} className="w-full pl-9 pr-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/30 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{l.address}</label>
                    <AddressSearch value={form.address} onSelect={(address, lat, lng) => setForm((f) => ({ ...f, address, lat: lat.toString(), lng: lng.toString() }))} showCountrySelect onCountryChange={(dial) => setForm((f) => ({ ...f, phone: f.phone && !f.phone.startsWith("+") ? f.phone : dial + " " }))} />
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
                    {form.name && (
                      <button type="button" onClick={() => setShowPreview(true)} className="px-4 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {l.preview}
                      </button>
                    )}
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
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required minLength={8} value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2.5 pr-10 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none" />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors">
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </div>
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
                          {u.email === sessionEmail && <span className="px-1.5 py-0.5 text-[9px] font-semibold text-sky-400 bg-sky-500/10 rounded border border-sky-500/20">{l.you}</span>}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {u.email}
                          <span className="mx-1.5 text-gray-700">·</span>
                          <span className="text-gray-500">{u.lastLogin ? formatTimeAgo(u.lastLogin, lang) : l.never}</span>
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEditUser(u)} className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all" title={l.editUser}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {u.has2FA && u.email !== sessionEmail && (
                          <button onClick={() => handleReset2FA(u.email)} className="p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-400/5 rounded-lg transition-all" title={l.reset2fa}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        )}
                        {u.email !== sessionEmail && (
                          <>
                            <button onClick={() => handleToggleRole(u.email, u.role)} className={`p-2 rounded-lg transition-all ${u.role === "superadmin" ? "text-[#D4AF37] hover:text-orange-400 hover:bg-orange-400/5" : "text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"}`} title={u.role === "superadmin" ? l.demoteConfirm : l.promoteConfirm}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={u.role === "superadmin" ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} /></svg>
                            </button>
                            <button onClick={() => handleDeleteUser(u.email)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all" title={l.deleteUser}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
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
