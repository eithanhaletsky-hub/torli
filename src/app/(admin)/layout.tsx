import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SessionProvider from "@/components/SessionProvider";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { slug: true },
  });

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar businessSlug={business?.slug} />
        <main className="lg:mr-64 p-6 lg:p-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
