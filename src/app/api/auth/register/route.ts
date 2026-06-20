import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateSlug, getCategoryConfig } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { name, email, password, businessName, category } = await req.json();

    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "אימייל כבר קיים במערכת" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let slug = generateSlug(businessName);

    const slugExists = await prisma.business.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const catConfig = getCategoryConfig(category || "salon");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        business: {
          create: {
            name: businessName,
            slug,
            category: category || "salon",
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
            services: {
              create: catConfig.defaultServices.map((s, i) => ({
                name: s.name,
                duration: s.duration,
                price: s.price,
                color: s.color,
                sortOrder: i,
              })),
            },
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
