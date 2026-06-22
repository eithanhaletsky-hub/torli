import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!dateStr || !serviceId)
    return NextResponse.json({ error: "חסרים פרמטרים" }, { status: 400 });

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { businessHours: true },
  });
  if (!business)
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id },
  });
  if (!service)
    return NextResponse.json({ error: "שירות לא נמצא" }, { status: 404 });

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const hours = business.businessHours.find((h) => h.dayOfWeek === dayOfWeek);

  if (!hours || !hours.isOpen)
    return NextResponse.json([]);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existingApts = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      date: { gte: dayStart, lt: dayEnd },
      status: { not: "cancelled" },
    },
    select: { date: true, endDate: true },
  });

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      businessId: business.id,
      date: { lt: dayEnd },
      endDate: { gt: dayStart },
    },
  });

  const [startHour, startMin] = hours.startTime.split(":").map(Number);
  const [endHour, endMin] = hours.endTime.split(":").map(Number);
  const slotInterval = 15;
  const slots: string[] = [];

  const now = new Date();

  for (let h = startHour; h <= endHour; h++) {
    for (let m = h === startHour ? startMin : 0; m < 60; m += slotInterval) {
      if (h === endHour && m >= endMin) break;

      const slotStart = new Date(date);
      slotStart.setHours(h, m, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

      const slotEndCheck = new Date(date);
      slotEndCheck.setHours(endHour, endMin, 0, 0);
      if (slotEnd > slotEndCheck) continue;

      if (slotStart <= now) continue;

      const hasConflict = existingApts.some((apt) => {
        const aptStart = new Date(apt.date).getTime();
        const aptEnd = new Date(apt.endDate).getTime();
        return slotStart.getTime() < aptEnd && slotEnd.getTime() > aptStart;
      });

      const isBlocked = blockedSlots.some((bs) => {
        const bsStart = new Date(bs.date).getTime();
        const bsEnd = new Date(bs.endDate).getTime();
        return slotStart.getTime() < bsEnd && slotEnd.getTime() > bsStart;
      });

      if (!hasConflict && !isBlocked) {
        slots.push(slotStart.toISOString());
      }
    }
  }

  return NextResponse.json(slots);
}
