import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateSlug } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { name, email, password, businessName, category } = await req.json();

    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" }, { status: 400 });
    }

    if (typeof email !== "string" || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "אימייל לא תקין" }, { status: 400 });
    }

    const sanitize = (s: string) => s.trim().slice(0, 200);
    const safeName = sanitize(name);
    const safeBusinessName = sanitize(businessName);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "אימייל כבר קיים במערכת" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let slug = generateSlug(safeBusinessName);

    const slugExists = await prisma.business.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const user = await prisma.user.create({
      data: {
        name: safeName,
        email: email.trim().toLowerCase(),
        passwordHash,
        business: {
          create: {
            name: safeBusinessName,
            slug,
            category: category || "consulting",
            businessHours: {
              create: [
                { dayOfWeek: 0, startTime: "09:00", endTime: "18:00", isOpen: true },
                { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isOpen: true },
                { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isOpen: true },
                { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isOpen: true },
                { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isOpen: true },
                { dayOfWeek: 5, startTime: "09:00", endTime: "14:00", isOpen: true },
                { dayOfWeek: 6, startTime: "09:00", endTime: "18:00", isOpen: false },
              ],
            },
            services: { create: [] },
          },
        },
      },
      include: { business: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      businessId: user.business?.id,
    });
  } catch {
    return NextResponse.json({ error: "שגיאה ביצירת חשבון" }, { status: 500 });
  }
}
