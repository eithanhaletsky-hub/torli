import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/business";

export async function GET(req: Request) {
  const businessId = await requireBusinessId();
  if (!businessId) return NextResponse.json([], { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const clients = await prisma.client.findMany({
    where: {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const businessId = await requireBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const data = await req.json();

  const client = await prisma.client.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      notes: data.notes || null,
      businessId,
    },
  });
  return NextResponse.json(client);
}
