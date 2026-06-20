"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronLeft, Plus, X } from "lucide-react";
import { cn, getHebrewDayName, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string;
  endDate: string;
  status: string;
  clientName: string;
  clientPhone: string;
  notes: string | null;
  service: { id: string; name: string; color: string; duration: number; price: number };
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00-20:00

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const fetchData = useCallback(async () => {
    const [aptRes, svcRes] = await Promise.all([
      fetch(`/api/appointments?from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`),
      fetch("/api/services"),
    ]);
    if (aptRes.ok) setAppointments(await aptRes.json());
    if (svcRes.ok) setServices(await svcRes.json());
    setLoading(false);
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }
  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }
  function goToday() {
    setCurrentDate(new Date());
  }

  function getAppointmentsForDay(day: Date) {
    return appointments.filter((a) => {
      const d = new Date(a.date);
      return d.toDateString() === day.toDateString();
    });
  }

  function getTopPosition(dateStr: string) {
    const d = new Date(dateStr);
    const hours = d.getHours() - 7;
    const minutes = d.getMinutes();
    return (hours * 60 + minutes) * (60 / 60); // 1px per minute
  }

  function getHeight(start: string, end: string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max((e - s) / 60000, 15); // min 15px
  }

  async function handleNewAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dateStr = form.get("date") as string;
    const timeStr = form.get("time") as string;
    const date = new Date(`${dateStr}T${timeStr}`);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date.toISOString(),
        serviceId: form.get("serviceId"),
        clientName: form.get("clientName"),
        clientPhone: form.get("clientPhone"),
        notes: form.get("notes") || null,
      }),
    });

    if (res.ok) {
      await fetchData();
      setShowNewForm(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchData();
    setSelectedApt(null);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">יומן</h1>
          <p className="text-gray-500 text-sm mt-1">
            {weekStart.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
            <button onClick={nextWeek} className="p-2 hover:bg-gray-50 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-50 rounded-lg">
              היום
            </button>
            <button onClick={prevWeek} className="p-2 hover:bg-gray-50 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            תור חדש
          </button>
        </div>
      </div>

      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">תור חדש</h2>
              <button onClick={() => setShowNewForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleNewAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שירות</label>
                <select name="serviceId" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">בחר שירות</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration} דק׳ • ₪{s.price})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
                  <input name="date" type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שעה</label>
                  <input name="time" type="time" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח</label>
                <input name="clientName" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input name="clientPhone" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" placeholder="050-1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                <input name="notes" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium">
                שמירה
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedApt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{selectedApt.clientName}</h2>
              <button onClick={() => setSelectedApt(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p><strong>שירות:</strong> {selectedApt.service.name}</p>
              <p><strong>טלפון:</strong> {selectedApt.clientPhone}</p>
              <p><strong>שעה:</strong> {new Date(selectedApt.date).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} - {new Date(selectedApt.endDate).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
              <p><strong>סטטוס:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedApt.status)}`}>{getStatusLabel(selectedApt.status)}</span></p>
              {selectedApt.notes && <p><strong>הערות:</strong> {selectedApt.notes}</p>}
            </div>
            <a
              href={`https://wa.me/972${selectedApt.clientPhone.replace(/[-\s]/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                `שלום ${selectedApt.clientName}, תזכורת: יש לך ${selectedApt.service.name} בתאריך ${new Date(selectedApt.date).toLocaleDateString("he-IL")} בשעה ${new Date(selectedApt.date).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition mb-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.856L0 24l6.335-1.652A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.89 0-3.694-.508-5.287-1.45l-.38-.224-3.934 1.025 1.05-3.824-.249-.395A9.787 9.787 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
              שלח תזכורת בוואטסאפ
            </a>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateStatus(selectedApt.id, "confirmed")} className="py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200">אישור</button>
              <button onClick={() => updateStatus(selectedApt.id, "completed")} className="py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium hover:bg-green-200">הושלם</button>
              <button onClick={() => updateStatus(selectedApt.id, "cancelled")} className="py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200">ביטול</button>
              <button onClick={() => updateStatus(selectedApt.id, "noshow")} className="py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">לא הגיע</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-3 text-center text-xs text-gray-400">שעה</div>
            {days.map((day) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={day.toISOString()} className={cn("p-3 text-center border-r border-gray-100", isToday && "bg-primary-50")}>
                  <p className="text-xs text-gray-400">{getHebrewDayName(day.getDay())}</p>
                  <p className={cn("text-lg font-bold", isToday ? "text-primary-600" : "text-gray-900")}>{day.getDate()}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-8 relative" style={{ height: `${HOURS.length * 60}px` }}>
            <div className="border-l border-gray-100">
              {HOURS.map((hour) => (
                <div key={hour} className="h-[60px] border-b border-gray-50 px-2 py-1">
                  <span className="text-xs text-gray-400">{String(hour).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>

            {days.map((day) => {
              const dayApts = getAppointmentsForDay(day);
              return (
                <div key={day.toISOString()} className="border-r border-gray-100 relative">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-gray-50" />
                  ))}
                  {dayApts.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedApt(apt)}
                      className="absolute right-0.5 left-0.5 rounded-lg px-1.5 py-0.5 text-xs text-white overflow-hidden hover:opacity-90 transition cursor-pointer"
                      style={{
                        top: `${getTopPosition(apt.date)}px`,
                        height: `${getHeight(apt.date, apt.endDate)}px`,
                        backgroundColor: apt.service.color,
                        minHeight: "20px",
                      }}
                    >
                      <p className="font-medium truncate">{apt.clientName}</p>
                      <p className="truncate opacity-80">{apt.service.name}</p>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
