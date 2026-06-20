import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "appointments";

  if (type === "appointments") {
    const appointments = await prisma.appointment.findMany({
      where: { businessId: business.id },
      include: { service: true },
      orderBy: { date: "desc" },
    });

    const statusLabels: Record<string, string> = {
      pending: "ממתין",
      confirmed: "מאושר",
      completed: "הושלם",
      cancelled: "בוטל",
      noshow: "לא הגיע",
    };

    const header = "תאריך,שעה,שם לקוח,טלפון,שירות,משך (דקות),מחיר,סטטוס,הערות";
    const rows = appointments.map(a => {
      const date = new Date(a.date);
      return [
        date.toLocaleDateString("he-IL"),
        date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        `"${a.clientName}"`,
        a.clientPhone,
        `"${a.service.name}"`,
        a.service.duration,
        a.service.price,
        statusLabels[a.status] || a.status,
        `"${(a.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const bom = "﻿";
    const csv = bom + [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="appointments-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (type === "clients") {
    const clients = await prisma.client.findMany({
      where: { businessId: business.id },
      include: { _count: { select: { appointments: true } } },
      orderBy: { name: "asc" },
    });

    const header = "שם,טלפון,אימייל,הערות,מספר תורים";
    const rows = clients.map(c => [
      `"${c.name}"`,
      c.phone,
      c.email || "",
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      c._count.appointments,
    ].join(","));

    const bom = "﻿";
    const csv = bom + [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "סוג לא תקין" }, { status: 400 });
}
