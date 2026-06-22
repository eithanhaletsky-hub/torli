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

export async function GET() {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json([], { status: 401 });

  const services = await prisma.service.findMany({
    where: { businessId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const businessId = await getBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const data = await req.json();
  const count = await prisma.service.count({ where: { businessId } });

  const service = await prisma.service.create({
    data: {
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      color: data.color || "#6366f1",
      sortOrder: count,
      businessId,
    },
  });
  return NextResponse.json(service);
}
