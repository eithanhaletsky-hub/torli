import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/business";

export async function GET() {
  const businessId = await requireBusinessId();
  if (!businessId) return NextResponse.json([], { status: 401 });

  const services = await prisma.service.findMany({
    where: { businessId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const businessId = await requireBusinessId();
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
