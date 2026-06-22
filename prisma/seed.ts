import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const businesses = [
  {
    email: "barber@torli.co.il",
    ownerName: "יוסי כהן",
    name: "הברבר של יוסי",
    slug: "barber-demo",
    category: "barber",
    description: "מספרה מקצועית לגברים ונשים",
    phone: "050-1112233",
    address: "רחוב אלנבי 35, תל אביב",
    primaryColor: "#6366f1",
    services: [
      { name: "תספורת גברים", description: "תספורת קלאסית או מודרנית", duration: 30, price: 80, color: "#6366f1", sortOrder: 0 },
      { name: "תספורת נשים", description: "תספורת + עיצוב", duration: 45, price: 120, color: "#ec4899", sortOrder: 1 },
      { name: "צבע שיער", description: "צביעה מקצועית", duration: 90, price: 250, color: "#f59e0b", sortOrder: 2 },
      { name: "עיצוב זקן", description: "גילוח ועיצוב זקן", duration: 15, price: 40, color: "#8b5cf6", sortOrder: 3 },
      { name: "החלקה", description: "החלקת שיער", duration: 120, price: 400, color: "#10b981", sortOrder: 4 },
    ],
  },
  {
    email: "psychology@torli.co.il",
    ownerName: "ד״ר נעמי גולן",
    name: "ד״ר נעמי גולן - פסיכולוגית קלינית",
    slug: "psychology-demo",
    category: "psychology",
    description: "טיפול פסיכולוגי פרטני, זוגי ומשפחתי",
    phone: "050-1234567",
    address: "רחוב הרצל 15, תל אביב",
    primaryColor: "#6366f1",
    services: [
      { name: "פגישת היכרות", description: "פגישה ראשונית להכרות ואבחון", duration: 50, price: 350, color: "#6366f1", sortOrder: 0 },
      { name: "טיפול פרטני", description: "פגישה טיפולית שבועית", duration: 50, price: 450, color: "#3b82f6", sortOrder: 1 },
      { name: "טיפול זוגי", description: "טיפול לזוגות", duration: 75, price: 550, color: "#ec4899", sortOrder: 2 },
      { name: "ייעוץ הורים", description: "הדרכת הורים", duration: 50, price: 400, color: "#10b981", sortOrder: 3 },
      { name: "אבחון פסיכולוגי", description: "אבחון מקיף", duration: 90, price: 800, color: "#f59e0b", sortOrder: 4 },
    ],
  },
  {
    email: "clinic@torli.co.il",
    ownerName: "ד״ר רונית שפירא",
    name: "קליניקת ד״ר שפירא",
    slug: "clinic-demo",
    category: "clinic",
    description: "קליניקה משפחתית מקצועית",
    phone: "03-9876543",
    address: "שדרות רוטשילד 42, תל אביב",
    primaryColor: "#3b82f6",
    services: [
      { name: "ייעוץ ראשוני", description: "בדיקה ואבחון ראשוני", duration: 45, price: 350, color: "#3b82f6", sortOrder: 0 },
      { name: "בדיקה תקופתית", description: "מעקב שוטף", duration: 30, price: 250, color: "#10b981", sortOrder: 1 },
      { name: "פיזיותרפיה", description: "טיפול פיזי ושיקום", duration: 45, price: 300, color: "#f59e0b", sortOrder: 2 },
      { name: "ייעוץ מעקב", description: "פגישת המשך", duration: 20, price: 200, color: "#8b5cf6", sortOrder: 3 },
    ],
  },
  {
    email: "beauty@torli.co.il",
    ownerName: "נועה ביטון",
    name: "ביוטי בר - נועה",
    slug: "beauty-demo",
    category: "beauty",
    description: "קוסמטיקה מתקדמת — ציפורניים, ריסים, טיפולי פנים",
    phone: "054-7654321",
    address: "רחוב דיזנגוף 80, תל אביב",
    primaryColor: "#ec4899",
    services: [
      { name: "מניקור", description: "מניקור קלאסי או ג'ל", duration: 45, price: 100, color: "#ec4899", sortOrder: 0 },
      { name: "פדיקור", description: "טיפול מפנק לכפות הרגליים", duration: 60, price: 120, color: "#f43f5e", sortOrder: 1 },
      { name: "טיפול פנים", description: "ניקוי עמוק והזנה", duration: 60, price: 200, color: "#a855f7", sortOrder: 2 },
      { name: "הסרת שיער בלייזר", description: "טכנולוגיה מתקדמת", duration: 30, price: 250, color: "#6366f1", sortOrder: 3 },
      { name: "איפור ערב", description: "איפור מקצועי לאירועים", duration: 45, price: 300, color: "#f59e0b", sortOrder: 4 },
    ],
  },
  {
    email: "fitness@torli.co.il",
    ownerName: "אורי מזרחי",
    name: "אורי מזרחי - מאמן כושר",
    slug: "fitness-demo",
    category: "fitness",
    description: "אימונים אישיים, פילאטיס ויוגה",
    phone: "052-8887777",
    address: "רחוב אבן גבירול 30, תל אביב",
    primaryColor: "#ef4444",
    services: [
      { name: "אימון אישי", description: "אימון מותאם 1 על 1", duration: 60, price: 200, color: "#ef4444", sortOrder: 0 },
      { name: "אימון זוגי", description: "אימון לזוגות או חברים", duration: 60, price: 300, color: "#f97316", sortOrder: 1 },
      { name: "יוגה פרטית", description: "שיעור יוגה אישי", duration: 75, price: 180, color: "#10b981", sortOrder: 2 },
      { name: "פילאטיס", description: "חיזוק ליבה וגמישות", duration: 55, price: 160, color: "#6366f1", sortOrder: 3 },
      { name: "ייעוץ תזונה", description: "תוכנית תזונה מותאמת", duration: 45, price: 250, color: "#f59e0b", sortOrder: 4 },
    ],
  },
  {
    email: "tutoring@torli.co.il",
    ownerName: "שרה לוי",
    name: "שרה לוי - מורה פרטית",
    slug: "tutoring-demo",
    category: "tutoring",
    description: "שיעורים פרטיים במתמטיקה, אנגלית ופיזיקה",
    phone: "050-3334444",
    address: "רחוב ז׳בוטינסקי 12, רמת גן",
    primaryColor: "#3b82f6",
    services: [
      { name: "שיעור מתמטיקה", description: "מתמטיקה לכל הרמות", duration: 60, price: 150, color: "#3b82f6", sortOrder: 0 },
      { name: "שיעור אנגלית", description: "אנגלית דבורה וכתיבה", duration: 60, price: 150, color: "#6366f1", sortOrder: 1 },
      { name: "שיעור פיזיקה", description: "פיזיקה לבגרות", duration: 60, price: 160, color: "#f59e0b", sortOrder: 2 },
      { name: "הכנה לבגרות", description: "מרתון הכנה מרוכז", duration: 90, price: 200, color: "#ef4444", sortOrder: 3 },
      { name: "עזרה בשיעורי בית", description: "עזרה לתלמידי יסודי", duration: 45, price: 100, color: "#10b981", sortOrder: 4 },
    ],
  },
  {
    email: "therapy@torli.co.il",
    ownerName: "מיכל לביא",
    name: "מיכל לביא - עיסוי וטיפולי גוף",
    slug: "therapy-demo",
    category: "therapy",
    description: "עיסוי, רפלקסולוגיה וטיפולי גוף",
    phone: "050-6665555",
    address: "רחוב בן יהודה 60, תל אביב",
    primaryColor: "#10b981",
    services: [
      { name: "עיסוי שוודי", description: "עיסוי הרפיה קלאסי", duration: 60, price: 280, color: "#10b981", sortOrder: 0 },
      { name: "רפלקסולוגיה", description: "טיפול דרך כפות הרגליים", duration: 45, price: 220, color: "#6366f1", sortOrder: 1 },
      { name: "דיקור סיני", description: "רפואה סינית מסורתית", duration: 60, price: 300, color: "#f59e0b", sortOrder: 2 },
      { name: "שיאצו", description: "טיפול יפני בלחיצות", duration: 60, price: 260, color: "#ec4899", sortOrder: 3 },
      { name: "טיפול באבנים חמות", description: "הרפיה עמוקה", duration: 75, price: 350, color: "#8b5cf6", sortOrder: 4 },
    ],
  },
  {
    email: "pets@torli.co.il",
    ownerName: "רונן דוד",
    name: "הספא של הכלבים - רונן",
    slug: "pets-demo",
    category: "pets",
    description: "טיפוח כלבים מקצועי ושירותי וטרינר",
    phone: "050-7778888",
    address: "רחוב סוקולוב 22, הרצליה",
    primaryColor: "#f59e0b",
    services: [
      { name: "רחצה וסירוק", description: "אמבטיה מלאה עם סירוק", duration: 60, price: 120, color: "#f59e0b", sortOrder: 0 },
      { name: "תספורת מלאה", description: "תספורת לפי גזע", duration: 90, price: 200, color: "#6366f1", sortOrder: 1 },
      { name: "גזירת ציפורניים", description: "גזירה בטוחה ומקצועית", duration: 15, price: 40, color: "#10b981", sortOrder: 2 },
      { name: "ניקוי אוזניים", description: "ניקוי וטיפול", duration: 15, price: 40, color: "#3b82f6", sortOrder: 3 },
      { name: "בדיקת בריאות", description: "בדיקה כללית", duration: 30, price: 250, color: "#ef4444", sortOrder: 4 },
    ],
  },
  {
    email: "garage@torli.co.il",
    ownerName: "משה אברהם",
    name: "מוסך אברהם",
    slug: "garage-demo",
    category: "garage",
    description: "מוסך מורשה לכל סוגי הרכבים",
    phone: "03-9991111",
    address: "רחוב התעשייה 8, חולון",
    primaryColor: "#ef4444",
    services: [
      { name: "טסט שנתי", description: "הכנה ובדיקה לטסט", duration: 60, price: 250, color: "#ef4444", sortOrder: 0 },
      { name: "החלפת שמן", description: "החלפת שמן + פילטר", duration: 30, price: 150, color: "#f59e0b", sortOrder: 1 },
      { name: "בדיקת בלמים", description: "בדיקה והחלפה", duration: 45, price: 200, color: "#3b82f6", sortOrder: 2 },
      { name: "טיפול 10,000 ק״מ", description: "טיפול תקופתי מלא", duration: 90, price: 500, color: "#6366f1", sortOrder: 3 },
      { name: "אבחון תקלות", description: "אבחון ממוחשב", duration: 45, price: 180, color: "#10b981", sortOrder: 4 },
    ],
  },
  {
    email: "consulting@torli.co.il",
    ownerName: "דוד אשכנזי",
    name: "דוד אשכנזי - ייעוץ עסקי",
    slug: "consulting-demo",
    category: "consulting",
    description: "ייעוץ עסקי ואסטרטגי לעסקים קטנים ובינוניים",
    phone: "03-5554444",
    address: "מגדל אלקטרה, רחוב יגאל אלון 98, תל אביב",
    primaryColor: "#3b82f6",
    services: [
      { name: "ייעוץ ראשוני", description: "היכרות ואבחון צרכים", duration: 60, price: 400, color: "#3b82f6", sortOrder: 0 },
      { name: "פגישת מעקב", description: "מעקב יישום והתקדמות", duration: 45, price: 300, color: "#6366f1", sortOrder: 1 },
      { name: "ייעוץ מקוון", description: "פגישה בזום", duration: 30, price: 250, color: "#10b981", sortOrder: 2 },
      { name: "סדנה אישית", description: "סדנת עבודה מעמיקה", duration: 120, price: 800, color: "#f59e0b", sortOrder: 3 },
    ],
  },
];

const defaultHours = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "19:00", isOpen: true },
  { dayOfWeek: 1, startTime: "09:00", endTime: "19:00", isOpen: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "19:00", isOpen: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "19:00", isOpen: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "19:00", isOpen: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "14:00", isOpen: true },
  { dayOfWeek: 6, startTime: "00:00", endTime: "00:00", isOpen: false },
];

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 12);

  for (const biz of businesses) {
    const user = await prisma.user.upsert({
      where: { email: biz.email },
      update: {},
      create: {
        email: biz.email,
        name: biz.ownerName,
        passwordHash,
        business: {
          create: {
            name: biz.name,
            slug: biz.slug,
            category: biz.category,
            description: biz.description,
            phone: biz.phone,
            address: biz.address,
            primaryColor: biz.primaryColor,
            businessHours: { create: defaultHours },
            services: { create: biz.services },
          },
        },
      },
      include: { business: { include: { services: true } } },
    });

    console.log(`Created: ${biz.name} → /book/${biz.slug}`);
  }

  console.log("\nSeed completed! All demo businesses created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
