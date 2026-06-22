import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const business = await prisma.business.findFirst({
    include: {
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      owner: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json(business);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const data = await req.json();

  const business = await prisma.business.findFirst();
  if (!business) return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  if (data.businessHours) {
    for (const bh of data.businessHours) {
      await prisma.businessHours.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: bh.dayOfWeek } },
        update: { startTime: bh.startTime, endTime: bh.endTime, isOpen: bh.isOpen },
        create: { businessId: business.id, dayOfWeek: bh.dayOfWeek, startTime: bh.startTime, endTime: bh.endTime, isOpen: bh.isOpen },
      });
    }
  }

  if (data.ownerName) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.ownerName },
    });
  }

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: {
      name: data.name ?? business.name,
      description: data.description ?? business.description,
      phone: data.phone ?? business.phone,
      address: data.address ?? business.address,
      primaryColor: data.primaryColor ?? business.primaryColor,
    },
    include: {
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      owner: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(updated);
}
