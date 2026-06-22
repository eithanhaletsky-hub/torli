"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, GripVertical, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { getCategoryConfig, type BookingField } from "@/lib/utils";

interface Business {
  name: string;
  category: string;
  slug: string;
  primaryColor: string;
  bookingFields: BookingField[] | null;
  bookingTitle: string | null;
  bookingSuccessMsg: string | null;
}

const FIELD_TYPES = [
  { value: "text", label: "טקסט" },
  { value: "tel", label: "טלפון" },
  { value: "email", label: "אימייל" },
  { value: "textarea", label: "טקסט ארוך" },
  { value: "select", label: "בחירה מרשימה" },
];

export default function BookingEditorPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [fields, setFields] = useState<BookingField[]>([]);
  const [bookingTitle, setBookingTitle] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((biz: Business) => {
        setBusiness(biz);
        const catConfig = getCategoryConfig(biz.category);
        setFields(
          biz.bookingFields && (biz.bookingFields as BookingField[]).length > 0
            ? (biz.bookingFields as BookingField[])
            : catConfig.bookingFields
        );
        setBookingTitle(biz.bookingTitle || "");
        setSuccessMsg(biz.bookingSuccessMsg || "");
      });
  }, []);

  function addField() {
    setFields([
      ...fields,
      {
        id: `custom_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
        placeholder: "",
      },
    ]);
  }

  function updateField(index: number, updates: Partial<BookingField>) {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  }

  function removeField(index: number) {
    const field = fields[index];
    if (field.id === "clientName" || field.id === "clientPhone") return;
    setFields(fields.filter((_, i) => i !== index));
  }

  function moveField(index: number, direction: "up" | "down") {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  }

  function addOption(fieldIndex: number) {
    const field = fields[fieldIndex];
    const options = field.options || [{ value: "", label: "בחר" }];
    updateField(fieldIndex, {
      options: [...options, { value: `opt_${Date.now()}`, label: "" }],
    });
  }

  function updateOption(fieldIndex: number, optIndex: number, label: string) {
    const field = fields[fieldIndex];
    const options = [...(field.options || [])];
    options[optIndex] = { ...options[optIndex], label, value: label.toLowerCase().replace(/\s+/g, "_") || `opt_${optIndex}` };
    updateField(fieldIndex, { options });
  }

  function removeOption(fieldIndex: number, optIndex: number) {
    const field = fields[fieldIndex];
    const options = (field.options || []).filter((_, i) => i !== optIndex);
    updateField(fieldIndex, { options });
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/business/booking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingFields: fields,
        bookingTitle: bookingTitle || null,
        bookingSuccessMsg: successMsg || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetToDefaults() {
    if (!business) return;
    const catConfig = getCategoryConfig(business.category);
    setFields(catConfig.bookingFields);
    setBookingTitle("");
    setSuccessMsg("");
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const catConfig = getCategoryConfig(business.category);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">עריכת דף הזמנה</h1>
        <div className="flex gap-2">
          <a
            href={`/book/${business.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4" />
            תצוגה מקדימה
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "שומר..." : saved ? "נשמר!" : "שמור שינויים"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">כותרת והודעות</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כותרת דף ההזמנה (אופציונלי)
              </label>
              <input
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                placeholder={catConfig.serviceLabel}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                השאר ריק להשתמש בברירת מחדל: &quot;{catConfig.serviceLabel}&quot;
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                הודעת הצלחה (אופציונלי)
              </label>
              <input
                value={successMsg}
                onChange={(e) => setSuccessMsg(e.target.value)}
                placeholder={catConfig.successMessage}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                ההודעה שהלקוח יראה אחרי שקבע תור בהצלחה
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">שדות הטופס</h2>
            <button
              onClick={resetToDefaults}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              איפוס לברירת מחדל
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            הגדר אילו שדות הלקוח ימלא כשהוא קובע תור. שם וטלפון הם חובה ולא ניתנים למחיקה.
          </p>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const isProtected = field.id === "clientName" || field.id === "clientPhone";
              return (
                <div
                  key={field.id + index}
                  className="border border-gray-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="שם השדה"
                        disabled={isProtected}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const updates: Partial<BookingField> = { type: newType };
                          if (newType === "select" && !field.options) {
                            updates.options = [{ value: "", label: "בחר" }];
                          }
                          updateField(index, updates);
                        }}
                        disabled={isProtected}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveField(index, "down")}
                        disabled={index === fields.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      {!isProtected && (
                        <button
                          onClick={() => removeField(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      placeholder="טקסט placeholder (אופציונלי)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        disabled={isProtected}
                        className="rounded"
                      />
                      חובה
                    </label>
                  </div>

                  {field.type === "select" && (
                    <div className="pr-6 space-y-2">
                      <p className="text-xs text-gray-500">אפשרויות בחירה:</p>
                      {(field.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            value={opt.label}
                            onChange={(e) => updateOption(index, optIdx, e.target.value)}
                            placeholder={optIdx === 0 ? "כותרת ברירת מחדל (למשל: בחר)" : "אפשרות"}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          {optIdx > 0 && (
                            <button
                              onClick={() => removeOption(index, optIdx)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(index)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        + הוסף אפשרות
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={addField}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-primary-400 hover:text-primary-600 transition w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            הוסף שדה חדש
          </button>
        </div>
      </div>
    </div>
  );
}
