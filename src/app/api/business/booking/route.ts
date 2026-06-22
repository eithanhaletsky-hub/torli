import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "לא מורשה" }, { status: 401 });

  const business = await prisma.business.findFirst();
  if (!business) return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  const data = await req.json();

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: {
      bookingFields: data.bookingFields ?? undefined,
      bookingTitle: data.bookingTitle ?? undefined,
      bookingSuccessMsg: data.bookingSuccessMsg ?? undefined,
    },
  });

  return NextResponse.json(updated);
}
