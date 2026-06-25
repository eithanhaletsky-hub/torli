import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { formatPrice, getStatusLabel, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: { owner: { select: { name: true } } },
  });
  if (!business) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const [
    todayAppointments,
    totalClients,
    weekAppointments,
    totalServices,
    recentAppointments,
    tomorrowAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        businessId: business.id,
        date: { gte: today, lt: tomorrow },
        status: { not: "cancelled" },
      },
    }),
    prisma.client.count({ where: { businessId: business.id } }),
    prisma.appointment.count({
      where: {
        businessId: business.id,
        date: { gte: weekAgo },
        status: "completed",
      },
    }),
    prisma.service.count({
      where: { businessId: business.id, isActive: true },
    }),
    prisma.appointment.findMany({
      where: { businessId: business.id, date: { gte: today } },
      include: { service: true },
      orderBy: { date: "asc" },
      take: 8,
    }),
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: tomorrow, lt: dayAfterTomorrow },
        status: { not: "cancelled" },
      },
      include: { service: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const weekRevenue = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      date: { gte: weekAgo },
      status: "completed",
    },
    include: { service: true },
  });

  const revenue = weekRevenue.reduce((sum, a) => sum + a.service.price, 0);

  const stats = [
    {
      label: "שיעורים היום",
      value: todayAppointments,
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "סה״כ תלמידים",
      value: totalClients,
      icon: Users,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "הושלמו השבוע",
      value: weekAppointments,
      icon: CheckCircle,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "הכנסות השבוע",
      value: formatPrice(revenue),
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          שלום, {business.owner.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">הנה סיכום השיעורים שלך</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className={`inline-flex p-2 rounded-xl ${stat.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">שיעורים קרובים</h2>
            <Link
              href="/calendar"
              className="text-sm text-primary-600 hover:underline"
            >
              לכל היומן
            </Link>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>אין שיעורים קרובים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-10 rounded-full"
                      style={{ backgroundColor: apt.service.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{apt.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {apt.service.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {new Date(apt.date).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(apt.status)}`}
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">פעולות מהירות</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/calendar"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm font-medium">שיעור חדש</span>
            </Link>
            <Link
              href="/clients"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">תלמיד חדש</span>
            </Link>
            <Link
              href="/services"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
            >
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm font-medium">מקצוע חדש</span>
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
            >
              <Clock className="w-6 h-6" />
              <span className="text-sm font-medium">שעות הוראה</span>
            </Link>
          </div>

          {totalServices === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>טיפ:</strong> התחל בהוספת המקצועות שאתה מלמד כדי שתלמידים יוכלו
                לקבוע שיעורים.
              </p>
            </div>
          )}
        </div>
      </div>

      {tomorrowAppointments.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📲</span>
            <h2 className="text-lg font-semibold">תזכורות למחר ({tomorrowAppointments.length} שיעורים)</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">לחץ על הכפתור כדי לשלוח תזכורת וואטסאפ לתלמיד</p>
          <div className="space-y-3">
            {tomorrowAppointments.map((apt) => {
              const time = new Date(apt.date).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
              const dateStr = new Date(apt.date).toLocaleDateString("he-IL");
              const phone = apt.clientPhone.replace(/[-\s]/g, "").replace(/^0/, "");
              const msg = encodeURIComponent(`שלום ${apt.clientName} 📚\nתזכורת: מחר יש לך שיעור ${apt.service.name} בשעה ${time}.\nנתראה! 😊`);
              return (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: apt.service.color }} />
                    <div>
                      <p className="font-medium text-sm">{apt.clientName}</p>
                      <p className="text-xs text-gray-500">{apt.service.name} · {time}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/972${phone}?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.856L0 24l6.335-1.652A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.89 0-3.694-.508-5.287-1.45l-.38-.224-3.934 1.025 1.05-3.824-.249-.395A9.787 9.787 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
                    שלח תזכורת
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
