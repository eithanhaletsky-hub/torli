"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Phone, Mail, Pencil, Trash2, ChevronLeft, Users } from "lucide-react";
import { getStatusLabel, getStatusColor, formatPrice } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: string;
  _count: { appointments: number };
}

interface ClientDetail extends Client {
  appointments: {
    id: string;
    date: string;
    status: string;
    service: { name: string; price: number };
  }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [selected, setSelected] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [search]);

  async function fetchClients() {
    const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
    if (res.ok) setClients(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email") || null,
      notes: form.get("notes") || null,
    };

    const url = editing ? `/api/clients/${editing.id}` : "/api/clients";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await fetchClients();
      setShowForm(false);
      setEditing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הלקוח?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    await fetchClients();
    if (selected?.id === id) setSelected(null);
  }

  async function viewClient(id: string) {
    const res = await fetch(`/api/clients/${id}`);
    if (res.ok) setSelected(await res.json());
  }

  if (selected) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          חזרה לרשימה
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{selected.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {selected.phone}
                </span>
                {selected.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {selected.email}
                  </span>
                )}
              </div>
              {selected.notes && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {selected.notes}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">
                {selected._count.appointments}
              </p>
              <p className="text-xs text-gray-500">ביקורים</p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">היסטוריית תורים</h2>
        <div className="space-y-2">
          {selected.appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">{apt.service.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(apt.date).toLocaleDateString("he-IL")} בשעה{" "}
                  {new Date(apt.date).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {formatPrice(apt.service.price)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(apt.status)}`}
                >
                  {getStatusLabel(apt.status)}
                </span>
              </div>
            </div>
          ))}
          {selected.appointments.length === 0 && (
            <p className="text-center text-gray-400 py-8">אין תורים עדיין</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">לקוחות</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} לקוחות</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          לקוח חדש
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם או טלפון..."
          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "עריכת לקוח" : "לקוח חדש"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
                <input
                  name="name"
                  required
                  defaultValue={editing?.name}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  name="phone"
                  required
                  defaultValue={editing?.phone}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="050-1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editing?.email || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                <input
                  name="notes"
                  defaultValue={editing?.notes || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium"
              >
                {editing ? "עדכון" : "הוספה"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600">אין לקוחות עדיין</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer"
              onClick={() => viewClient(client.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {client._count.appointments} תורים
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(client);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(client.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
