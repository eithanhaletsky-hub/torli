import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTerminology, getDefaultBookingFields } from "@/lib/config";

export async function GET() {
  const business = await prisma.business.findFirst({
    include: {
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      businessHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!business)
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });

  const terminology = getTerminology();

  const customFields = business.bookingFields as unknown[];
  const hasCustomFields = Array.isArray(customFields) && customFields.length > 0;

  return NextResponse.json({
    id: business.id,
    name: business.name,
    description: business.description,
    phone: business.phone,
    address: business.address,
    primaryColor: business.primaryColor,
    services: business.services,
    businessHours: business.businessHours,
    categoryConfig: {
      clientTerm: terminology.clientTerm,
      appointmentTerm: terminology.appointmentTerm,
      serviceLabel: business.bookingTitle || terminology.serviceLabel,
      dateLabel: terminology.dateLabel,
      detailsLabel: terminology.detailsLabel,
      successMessage: business.bookingSuccessMsg || terminology.successMessage,
      bookingFields: hasCustomFields ? customFields : getDefaultBookingFields(),
    },
  });
}
