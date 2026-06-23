"use client";

import { useEffect, useState } from "react";
import { Save, Download, Copy, Check } from "lucide-react";
import { getHebrewDayName, CATEGORIES } from "@/lib/utils";

interface BusinessHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

interface Business {
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  slug: string;
  primaryColor: string;
  businessHours: BusinessHour[];
  owner: { name: string; email: string };
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/business").then(r => r.json()).then(setBusiness);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);

    const form = new FormData(e.currentTarget);
    await fetch("/api/business", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        category: form.get("category"),
        description: form.get("description") || null,
        phone: form.get("phone") || null,
        address: form.get("address") || null,
        primaryColor: form.get("primaryColor"),
        ownerName: form.get("ownerName"),
        businessHours: business.businessHours,
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateHour(dayOfWeek: number, field: string, value: string | boolean) {
    if (!business) return;
    setBusiness({
      ...business,
      businessHours: business.businessHours.map(bh =>
        bh.dayOfWeek === dayOfWeek ? { ...bh, [field]: value } : bh
      ),
    });
  }

  function getBookingUrl() {
    if (typeof window === "undefined" || !business) return "";
    return `${window.location.origin}/book/${business.slug}`;
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getBookingUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getBookingUrl())}`;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">הגדרות</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">פרטים אישיים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">השם שלך</label>
              <input name="ownerName" defaultValue={business.owner?.name || ""} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input value={business.owner?.email || ""} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">פרטי ההוראה</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם (כפי שיוצג לתלמידים)</label>
              <input name="name" defaultValue={business.name} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תחום הוראה</label>
              <select name="category" defaultValue={business.category} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <input name="phone" defaultValue={business.phone || ""} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
              <textarea name="description" defaultValue={business.description || ""} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
              <input name="address" defaultValue={business.address || ""} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">צבע ראשי</label>
              <input name="primaryColor" type="color" defaultValue={business.primaryColor} className="w-16 h-10 rounded-xl border border-gray-300 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">קישור הזמנה ו-QR Code</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-3">שתף את הקישור הזה עם תלמידים והורים כדי שיוכלו לקבוע שיעורים:</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-50 px-4 py-2.5 rounded-xl text-sm border border-gray-200 truncate" dir="ltr">
                  {getBookingUrl()}
                </code>
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center gap-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "הועתק!" : "העתק"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">שלח בוואטסאפ להורים או לתלמידים</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img src={qrUrl} alt="QR Code" className="w-[150px] h-[150px] rounded-xl border border-gray-200" />
              <a
                href={qrUrl}
                download={`qr-${business.slug}.png`}
                className="text-xs text-primary-600 hover:underline"
              >
                הורד QR Code
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">שעות הוראה</h2>
          <div className="space-y-3">
            {business.businessHours.map((bh) => (
              <div key={bh.dayOfWeek} className="flex items-center gap-4">
                <label className="flex items-center gap-2 w-24">
                  <input
                    type="checkbox"
                    checked={bh.isOpen}
                    onChange={(e) => updateHour(bh.dayOfWeek, "isOpen", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{getHebrewDayName(bh.dayOfWeek)}</span>
                </label>
                {bh.isOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={bh.startTime}
                      onChange={(e) => updateHour(bh.dayOfWeek, "startTime", e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="text-gray-400">עד</span>
                    <input
                      type="time"
                      value={bh.endTime}
                      onChange={(e) => updateHour(bh.dayOfWeek, "endTime", e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">לא מלמד</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">ייצוא נתונים</h2>
          <p className="text-sm text-gray-500 mb-4">הורד את הנתונים שלך כקובץ CSV לגיליון אלקטרוני (Excel, Google Sheets)</p>
          <div className="flex gap-3">
            <a
              href="/api/export?type=appointments"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              ייצוא שיעורים
            </a>
            <a
              href="/api/export?type=clients"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              ייצוא תלמידים
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "שומר..." : saved ? "נשמר ✓" : "שמירת שינויים"}
        </button>
      </form>
    </div>
  );
}
