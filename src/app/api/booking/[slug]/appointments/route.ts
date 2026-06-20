import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business)
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  const data = await req.json();
  const { serviceId, date, clientName, clientPhone, notes } = data;

  if (!serviceId || !date || !clientName || !clientPhone)
    return NextResponse.json({ error: "חסרים שדות" }, { status: 400 });

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id, isActive: true },
  });
  if (!service)
    return NextResponse.json({ error: "שירות לא נמצא" }, { status: 400 });

  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + service.duration * 60000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      businessId: business.id,
      status: { not: "cancelled" },
      date: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (conflict)
    return NextResponse.json({ error: "השעה כבר תפוסה" }, { status: 409 });

  let client = await prisma.client.findFirst({
    where: { phone: clientPhone, businessId: business.id },
  });

  if (!client) {
    client = await prisma.client.create({
      data: { name: clientName, phone: clientPhone, businessId: business.id },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      date: startDate,
      endDate,
      clientName,
      clientPhone,
      notes: notes || null,
      status: "pending",
      businessId: business.id,
      serviceId,
      clientId: client.id,
    },
  });

  return NextResponse.json(appointment);
}
