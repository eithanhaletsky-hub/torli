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

  const [
    todayAppointments,
    totalClients,
    weekAppointments,
    totalServices,
    recentAppointments,
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
    </div>
  );
}
