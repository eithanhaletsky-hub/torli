"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const res = await fetch("/api/services");
    if (res.ok) setServices(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      description: form.get("description") || null,
      duration: Number(form.get("duration")),
      price: Number(form.get("price")),
      color: form.get("color"),
    };

    const url = editing ? `/api/services/${editing.id}` : "/api/services";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await fetchServices();
      setShowForm(false);
      setEditing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את השירות?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    await fetchServices();
  }

  async function toggleActive(service: Service) {
    await fetch(`/api/services/${service.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !service.isActive }),
    });
    await fetchServices();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">שירותים</h1>
          <p className="text-gray-500 text-sm mt-1">
            נהל את השירותים שהעסק שלך מציע
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          שירות חדש
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "עריכת שירות" : "שירות חדש"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם השירות
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editing?.name}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="תספורת גברים"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור (אופציונלי)
                </label>
                <input
                  name="description"
                  defaultValue={editing?.description || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="כולל שטיפה ועיצוב"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  משך (דקות)
                </label>
                <input
                  name="duration"
                  type="number"
                  required
                  min={5}
                  step={5}
                  defaultValue={editing?.duration || 30}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מחיר (₪)
                </label>
                <input
                  name="price"
                  type="number"
                  required
                  min={0}
                  defaultValue={editing?.price || 0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  צבע
                </label>
                <input
                  name="color"
                  type="color"
                  defaultValue={editing?.color || "#6366f1"}
                  className="w-16 h-10 rounded-xl border border-gray-300 cursor-pointer"
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
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <GripVertical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600">
            אין שירותים עדיין
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            הוסף את השירות הראשון שלך כדי להתחיל
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-12 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{service.duration} דקות</span>
                    <span>{formatPrice(service.price)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(service)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                    service.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {service.isActive ? "פעיל" : "מושבת"}
                </button>
                <button
                  onClick={() => {
                    setEditing(service);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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
