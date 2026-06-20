"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Clock, MapPin, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import { cn, getHebrewDayName } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
}

interface BookingField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface BusinessData {
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  primaryColor: string;
  services: Service[];
  businessHours: { dayOfWeek: number; isOpen: boolean }[];
  categoryConfig: {
    clientTerm: string;
    appointmentTerm: string;
    serviceLabel: string;
    dateLabel: string;
    detailsLabel: string;
    successMessage: string;
    bookingFields: BookingField[];
  };
}

type Step = "service" | "date" | "details" | "done";

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    fetch(`/api/booking/${slug}`).then(r => r.json()).then(setBusiness);
  }, [slug]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const dateStr = selectedDate.toISOString().split("T")[0];
      fetch(`/api/booking/${slug}/slots?date=${dateStr}&serviceId=${selectedService.id}`)
        .then(r => r.json())
        .then(s => { setSlots(s); setLoadingSlots(false); });
    }
  }, [selectedDate, selectedService, slug]);

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }

  function isDateAvailable(date: Date) {
    if (!business) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    const bh = business.businessHours.find(h => h.dayOfWeek === date.getDay());
    return bh?.isOpen ?? false;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const extraFields: Record<string, string> = {};
    for (const field of business!.categoryConfig.bookingFields) {
      if (field.id !== "clientName" && field.id !== "clientPhone" && field.id !== "notes") {
        const val = form.get(field.id) as string;
        if (val) {
          const label = field.label.replace(" (אופציונלי)", "");
          if (field.options) {
            const opt = field.options.find(o => o.value === val);
            extraFields[label] = opt?.label || val;
          } else {
            extraFields[label] = val;
          }
        }
      }
    }

    const notesBase = (form.get("notes") as string) || "";
    const extraLines = Object.entries(extraFields).map(([k, v]) => `${k}: ${v}`).join("\n");
    const combinedNotes = [extraLines, notesBase].filter(Boolean).join("\n---\n");

    const res = await fetch(`/api/booking/${slug}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedService!.id,
        date: selectedSlot,
        clientName: form.get("clientName"),
        clientPhone: form.get("clientPhone"),
        notes: combinedNotes || null,
      }),
    });

    if (res.ok) {
      setStep("done");
    } else {
      const body = await res.json();
      setError(body.error || "שגיאה בהזמנה");
    }
    setSubmitting(false);
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const primaryColor = business.primaryColor;
  const config = business.categoryConfig;

  function renderField(field: BookingField) {
    const label = (
      <label key={`label-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}{!field.required && " (אופציונלי)"}
      </label>
    );

    if (field.type === "select" && field.options) {
      return (
        <div key={field.id}>
          {label}
          <select
            name={field.id}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.id}>
          {label}
          <textarea
            name={field.id}
            required={field.required}
            rows={2}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      );
    }

    return (
      <div key={field.id}>
        {label}
        <input
          name={field.id}
          type={field.type}
          required={field.required}
          dir={field.type === "tel" || field.type === "email" ? "ltr" : undefined}
          placeholder={field.placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>{business.name}</h1>
          {business.description && <p className="text-gray-500 mt-1 text-sm">{business.description}</p>}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            {business.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{business.phone}</span>}
            {business.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{business.address}</span>}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {(["service", "date", "details"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition",
                step === s || (["date","details","done"].indexOf(step) > ["service","date","details"].indexOf(s))
                  ? "text-white" : "bg-gray-200 text-gray-500"
              )} style={
                step === s || (["date","details","done"].indexOf(step) > ["service","date","details"].indexOf(s))
                  ? { backgroundColor: primaryColor } : {}
              }>
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {step === "service" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{config.serviceLabel}</h2>
            <div className="space-y-3">
              {business.services.map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep("date"); }}
                  className="w-full bg-white rounded-2xl border border-gray-100 p-5 text-right hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: service.color }} />
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                      <div className="flex gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration} דקות</span>
                        <span>₪{service.price}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "date" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{config.dateLabel}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => {
                  const d = new Date(calendarMonth);
                  d.setMonth(d.getMonth() + 1);
                  setCalendarMonth(d);
                }}><ChevronRight className="w-5 h-5" /></button>
                <span className="font-medium">
                  {calendarMonth.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}
                </span>
                <button onClick={() => {
                  const d = new Date(calendarMonth);
                  d.setMonth(d.getMonth() - 1);
                  setCalendarMonth(d);
                }}><ChevronLeft className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(calendarMonth).map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const available = isDateAvailable(day);
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={!available}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-9 rounded-lg text-sm font-medium transition",
                        !available && "text-gray-300 cursor-not-allowed",
                        available && !isSelected && "hover:bg-gray-100 text-gray-700",
                        isSelected && "text-white"
                      )}
                      style={isSelected ? { backgroundColor: primaryColor } : {}}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-medium mb-3">
                  שעות פנויות - {getHebrewDayName(selectedDate.getDay())}, {selectedDate.toLocaleDateString("he-IL")}
                </h3>
                {loadingSlots ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: primaryColor }} />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">אין שעות פנויות ביום זה</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => {
                      const time = new Date(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => { setSelectedSlot(slot); setStep("details"); }}
                          className={cn(
                            "py-2 rounded-xl text-sm font-medium transition border",
                            isSelected ? "text-white border-transparent" : "border-gray-200 hover:border-gray-300"
                          )}
                          style={isSelected ? { backgroundColor: primaryColor } : {}}
                        >
                          {time.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setStep("service")}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              ← חזרה לבחירת שירות
            </button>
          </div>
        )}

        {step === "details" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{config.detailsLabel}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: selectedService?.color }} />
                <div>
                  <p className="font-medium">{selectedService?.name}</p>
                  <p className="text-gray-400">
                    {selectedDate?.toLocaleDateString("he-IL")} בשעה{" "}
                    {selectedSlot && new Date(selectedSlot).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              {config.bookingFields.map(renderField)}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-white rounded-xl font-medium transition disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? "שולח..." : `אישור ${config.appointmentTerm}`}
              </button>
              <button type="button" onClick={() => setStep("date")} className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← חזרה לבחירת שעה
              </button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="text-center bg-white rounded-2xl border border-gray-100 p-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: primaryColor }}>
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">{config.successMessage}</h2>
            <p className="text-gray-500 mb-1">
              {selectedService?.name} - {selectedDate?.toLocaleDateString("he-IL")}
            </p>
            <p className="text-gray-500 mb-6">
              בשעה {selectedSlot && new Date(selectedSlot).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
            </p>
            {business.phone && (
              <a
                href={`https://wa.me/972${business.phone.replace(/[-\s]/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                  `שלום, קבעתי ${config.appointmentTerm} ל${selectedService?.name} בתאריך ${selectedDate?.toLocaleDateString("he-IL")} בשעה ${selectedSlot ? new Date(selectedSlot).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : ""}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition mb-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.856L0 24l6.335-1.652A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.89 0-3.694-.508-5.287-1.45l-.38-.224-3.934 1.025 1.05-3.824-.249-.395A9.787 9.787 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
                שלח אישור בוואטסאפ
              </a>
            )}
            <div>
              <button
                onClick={() => {
                  setStep("service");
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                }}
                className="px-6 py-2 border rounded-xl text-sm hover:bg-gray-50 transition"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                הזמנת {config.appointmentTerm} נוסף
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-xs text-gray-300">
          מופעל על ידי תורלי
        </div>
      </div>
    </div>
  );
}
