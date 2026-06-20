import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoryConfig } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      businessHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!business)
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  const catConfig = getCategoryConfig(business.category);

  const customFields = business.bookingFields as unknown[];
  const hasCustomFields = Array.isArray(customFields) && customFields.length > 0;

  return NextResponse.json({
    id: business.id,
    name: business.name,
    category: business.category,
    description: business.description,
    phone: business.phone,
    address: business.address,
    primaryColor: business.primaryColor,
    services: business.services,
    businessHours: business.businessHours,
    categoryConfig: {
      clientTerm: catConfig.clientTerm,
      appointmentTerm: catConfig.appointmentTerm,
      serviceLabel: business.bookingTitle || catConfig.serviceLabel,
      dateLabel: catConfig.dateLabel,
      detailsLabel: catConfig.detailsLabel,
      successMessage: business.bookingSuccessMsg || catConfig.successMessage,
      bookingFields: hasCustomFields ? customFields : catConfig.bookingFields,
    },
  });
}
