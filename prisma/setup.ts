import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "../torli.config";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.business.findFirst();
  if (existing) {
    console.log("העסק כבר קיים במסד הנתונים. דלג על setup.");
    console.log(`שם: ${existing.name}`);
    console.log(`כניסה למערכת: /login`);
    return;
  }

  const passwordHash = await bcrypt.hash(config.owner.password, 12);

  const slug = config.business.name
    .toLowerCase()
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/(^-|-$)/g, "") || "my-business";

  const user = await prisma.user.create({
    data: {
      name: config.owner.name,
      email: config.owner.email,
      passwordHash,
      business: {
        create: {
          name: config.business.name,
          slug,
          category: "custom",
          description: config.business.description,
          phone: config.business.phone,
          address: config.business.address,
          primaryColor: config.business.primaryColor,
          bookingFields: JSON.parse(JSON.stringify(config.bookingFields)),
          businessHours: {
            create: config.businessHours,
          },
          services: {
            create: config.defaultServices.map((s, i) => ({
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

  console.log("\n✅ Setup הושלם בהצלחה!\n");
  console.log(`שם העסק: ${config.business.name}`);
  console.log(`אימייל: ${config.owner.email}`);
  console.log(`סיסמה: ${config.owner.password}`);
  console.log(`\nכניסה למערכת: /login`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
