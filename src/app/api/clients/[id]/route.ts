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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const businessId = await getBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, businessId },
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        include: { service: true },
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  if (!client)
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  return NextResponse.json(client);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const businessId = await getBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  await prisma.client.updateMany({
    where: { id, businessId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      notes: data.notes || null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const businessId = await getBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const { id } = await params;
  await prisma.client.deleteMany({ where: { id, businessId } });
  return NextResponse.json({ ok: true });
}
