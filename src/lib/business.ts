import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function requireBusinessId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const business = await prisma.business.findFirst({ select: { id: true } });
  return business?.id || null;
}

export async function getTheBusiness() {
  return prisma.business.findFirst({
    include: {
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      owner: { select: { name: true, email: true } },
    },
  });
}

export async function getTheBusinessId(): Promise<string | null> {
  const business = await prisma.business.findFirst({ select: { id: true } });
  return business?.id || null;
}
