import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  return business?.id || null;
}

export async function GET(req: Request) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json([], { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { businessId };
  if (from && to) {
    where.date = { gte: new Date(from), lte: new Date(to) };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true, client: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const businessId = await getBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const data = await req.json();
  const service = await prisma.service.findFirst({
    where: { id: data.serviceId, businessId },
  });
  if (!service)
    return NextResponse.json({ error: "שירות לא נמצא" }, { status: 400 });

  const startDate = new Date(data.date);
  const endDate = new Date(startDate.getTime() + service.duration * 60000);

  let clientId: string | null = null;
  if (data.clientPhone) {
    const existing = await prisma.client.findFirst({
      where: { phone: data.clientPhone, businessId },
    });
    if (existing) {
      clientId = existing.id;
    } else {
      const newClient = await prisma.client.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
          businessId,
        },
      });
      clientId = newClient.id;
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      date: startDate,
      endDate,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      status: data.status || "confirmed",
      notes: data.notes || null,
      businessId,
      serviceId: data.serviceId,
      clientId,
    },
    include: { service: true },
  });
  return NextResponse.json(appointment);
}
