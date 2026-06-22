import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/business";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const businessId = await requireBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  await prisma.appointment.updateMany({
    where: { id, businessId },
    data,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const businessId = await requireBusinessId();
  if (!businessId)
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const { id } = await params;
  await prisma.appointment.deleteMany({ where: { id, businessId } });
  return NextResponse.json({ ok: true });
}
