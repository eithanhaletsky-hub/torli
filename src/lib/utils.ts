export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return `₪${price.toLocaleString("he-IL")}`;
}

export function formatTime(time: string): string {
  return time;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "numeric",
  }).format(date);
}

export function getHebrewDayName(dayOfWeek: number): string {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  return days[dayOfWeek];
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "ממתין",
    confirmed: "מאושר",
    completed: "הושלם",
    cancelled: "בוטל",
    noshow: "לא הגיע",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    noshow: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export interface BookingField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  clientTerm: string;
  clientTermPlural: string;
  appointmentTerm: string;
  appointmentTermPlural: string;
  serviceLabel: string;
  dateLabel: string;
  detailsLabel: string;
  successMessage: string;
  defaultServices: { name: string; duration: number; price: number; color: string }[];
  bookingFields: BookingField[];
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  barber: {
    id: "barber",
    label: "ברברים ומספרות",
    icon: "✂️",
    clientTerm: "לקוח",
    clientTermPlural: "לקוחות",
    appointmentTerm: "תור",
    appointmentTermPlural: "תורים",
    serviceLabel: "בחר טיפול",
    dateLabel: "בחר תאריך ושעה",
    detailsLabel: "פרטי הלקוח",
    successMessage: "התור נקבע בהצלחה! נתראה",
    defaultServices: [
      { name: "תספורת גברים", duration: 30, price: 80, color: "#6366f1" },
      { name: "תספורת נשים", duration: 45, price: 120, color: "#ec4899" },
      { name: "צבע שיער", duration: 90, price: 250, color: "#f59e0b" },
      { name: "עיצוב זקן", duration: 15, price: 40, color: "#8b5cf6" },
      { name: "החלקה", duration: 120, price: 400, color: "#10b981" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "notes", label: "הערות (סגנון מועדף, בקשות מיוחדות)", type: "textarea", required: false, placeholder: "למשל: תספורת קצרה בצדדים, ארוך למעלה" },
    ],
  },
  psychology: {
    id: "psychology",
    label: "טיפול נפשי / פסיכולוגיה",
    icon: "🧠",
    clientTerm: "מטופל",
    clientTermPlural: "מטופלים",
    appointmentTerm: "פגישה",
    appointmentTermPlural: "פגישות",
    serviceLabel: "בחר סוג טיפול",
    dateLabel: "בחר תאריך ושעה לפגישה",
    detailsLabel: "פרטי המטופל",
    successMessage: "הפגישה נקבעה בהצלחה! נא להגיע בזמן",
    defaultServices: [
      { name: "פגישת היכרות", duration: 50, price: 350, color: "#6366f1" },
      { name: "טיפול פרטני", duration: 50, price: 450, color: "#3b82f6" },
      { name: "טיפול זוגי", duration: 75, price: 550, color: "#ec4899" },
      { name: "ייעוץ הורים", duration: 50, price: 400, color: "#10b981" },
      { name: "אבחון פסיכולוגי", duration: 90, price: 800, color: "#f59e0b" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "שם מלא" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "age", label: "גיל", type: "text", required: false, placeholder: "למשל: 35" },
      { id: "referralSource", label: "הגעת דרך", type: "select", required: false, options: [
        { value: "", label: "בחר" },
        { value: "doctor", label: "הפניית רופא" },
        { value: "internet", label: "אינטרנט" },
        { value: "friend", label: "חבר/משפחה" },
        { value: "insurance", label: "קופת חולים" },
        { value: "returning", label: "מטופל חוזר" },
      ]},
      { id: "notes", label: "נושא הפנייה (אופציונלי)", type: "textarea", required: false, placeholder: "במה תרצה/י שנתמקד?" },
    ],
  },
  clinic: {
    id: "clinic",
    label: "קליניקה רפואית",
    icon: "🏥",
    clientTerm: "מטופל",
    clientTermPlural: "מטופלים",
    appointmentTerm: "פגישה",
    appointmentTermPlural: "פגישות",
    serviceLabel: "בחר סוג טיפול",
    dateLabel: "בחר תאריך ושעה לפגישה",
    detailsLabel: "פרטי המטופל",
    successMessage: "הפגישה נקבעה בהצלחה! נא להגיע 10 דקות לפני",
    defaultServices: [
      { name: "ייעוץ ראשוני", duration: 45, price: 350, color: "#3b82f6" },
      { name: "בדיקה תקופתית", duration: 30, price: 250, color: "#10b981" },
      { name: "טיפול שיניים", duration: 60, price: 400, color: "#6366f1" },
      { name: "פיזיותרפיה", duration: 45, price: 300, color: "#f59e0b" },
      { name: "ייעוץ מעקב", duration: 20, price: 200, color: "#8b5cf6" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "שם מלא כפי שמופיע בת.ז." },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "idNumber", label: "מספר תעודת זהות", type: "text", required: true, placeholder: "000000000" },
      { id: "healthInsurance", label: "קופת חולים", type: "select", required: true, options: [
        { value: "", label: "בחר קופת חולים" },
        { value: "clalit", label: "כללית" },
        { value: "maccabi", label: "מכבי" },
        { value: "meuhedet", label: "מאוחדת" },
        { value: "leumit", label: "לאומית" },
        { value: "private", label: "פרטי" },
      ]},
      { id: "referralSource", label: "הפניה מ-", type: "select", required: false, options: [
        { value: "", label: "בחר" },
        { value: "doctor", label: "רופא מפנה" },
        { value: "internet", label: "אינטרנט" },
        { value: "friend", label: "חבר/משפחה" },
        { value: "returning", label: "מטופל חוזר" },
      ]},
      { id: "notes", label: "סיבת הפנייה / תלונות", type: "textarea", required: false, placeholder: "תאר/י בקצרה את הסיבה לפגישה" },
    ],
  },
  beauty: {
    id: "beauty",
    label: "קוסמטיקה — ציפורניים, ריסים, טיפולי פנים",
    icon: "💅",
    clientTerm: "לקוחה",
    clientTermPlural: "לקוחות",
    appointmentTerm: "תור",
    appointmentTermPlural: "תורים",
    serviceLabel: "בחרי טיפול",
    dateLabel: "בחרי תאריך ושעה",
    detailsLabel: "פרטים אישיים",
    successMessage: "התור נקבע בהצלחה! מחכים לך",
    defaultServices: [
      { name: "מניקור", duration: 45, price: 100, color: "#ec4899" },
      { name: "פדיקור", duration: 60, price: 120, color: "#f43f5e" },
      { name: "טיפול פנים", duration: 60, price: 200, color: "#a855f7" },
      { name: "הסרת שיער בלייזר", duration: 30, price: 250, color: "#6366f1" },
      { name: "איפור ערב", duration: 45, price: 300, color: "#f59e0b" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "skinType", label: "סוג עור", type: "select", required: false, options: [
        { value: "", label: "בחרי סוג עור" },
        { value: "normal", label: "רגיל" },
        { value: "dry", label: "יבש" },
        { value: "oily", label: "שמנוני" },
        { value: "combination", label: "מעורב" },
        { value: "sensitive", label: "רגיש" },
      ]},
      { id: "allergies", label: "אלרגיות ידועות", type: "text", required: false, placeholder: "למשל: לטקס, ניקל, חומרי ניקוי" },
      { id: "notes", label: "העדפות מיוחדות", type: "textarea", required: false, placeholder: "צבע מועדף, סגנון רצוי, דברים שחשוב שנדע" },
    ],
  },
  fitness: {
    id: "fitness",
    label: "מאמני כושר / פילאטיס ויוגה",
    icon: "💪",
    clientTerm: "מתאמן",
    clientTermPlural: "מתאמנים",
    appointmentTerm: "אימון",
    appointmentTermPlural: "אימונים",
    serviceLabel: "בחר סוג אימון",
    dateLabel: "בחר תאריך ושעה לאימון",
    detailsLabel: "פרטי המתאמן",
    successMessage: "האימון נקבע! תביא/י ביגוד ומים",
    defaultServices: [
      { name: "אימון אישי", duration: 60, price: 200, color: "#ef4444" },
      { name: "אימון זוגי", duration: 60, price: 300, color: "#f97316" },
      { name: "יוגה פרטית", duration: 75, price: 180, color: "#10b981" },
      { name: "פילאטיס", duration: 55, price: 160, color: "#6366f1" },
      { name: "ייעוץ תזונה", duration: 45, price: 250, color: "#f59e0b" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "fitnessLevel", label: "רמת כושר", type: "select", required: true, options: [
        { value: "", label: "בחר רמת כושר" },
        { value: "beginner", label: "מתחיל - אין ניסיון קודם" },
        { value: "intermediate", label: "בינוני - מתאמן לפעמים" },
        { value: "advanced", label: "מתקדם - מתאמן באופן קבוע" },
      ]},
      { id: "fitnessGoal", label: "מטרת האימון", type: "select", required: true, options: [
        { value: "", label: "בחר מטרה" },
        { value: "weight_loss", label: "ירידה במשקל" },
        { value: "muscle", label: "בניית שריר" },
        { value: "flexibility", label: "גמישות ותנועתיות" },
        { value: "endurance", label: "סיבולת" },
        { value: "rehab", label: "שיקום פציעה" },
        { value: "general", label: "כושר כללי" },
      ]},
      { id: "healthLimitations", label: "מגבלות בריאותיות", type: "textarea", required: false, placeholder: "פציעות, כאבי גב, בעיות ברכיים וכו'" },
    ],
  },
  therapy: {
    id: "therapy",
    label: "עיסוי וטיפולי גוף",
    icon: "🧘",
    clientTerm: "מטופל",
    clientTermPlural: "מטופלים",
    appointmentTerm: "טיפול",
    appointmentTermPlural: "טיפולים",
    serviceLabel: "בחר סוג טיפול",
    dateLabel: "בחר תאריך ושעה לטיפול",
    detailsLabel: "פרטי המטופל",
    successMessage: "הטיפול נקבע בהצלחה! נא להגיע בבגדים נוחים",
    defaultServices: [
      { name: "עיסוי שוודי", duration: 60, price: 280, color: "#10b981" },
      { name: "רפלקסולוגיה", duration: 45, price: 220, color: "#6366f1" },
      { name: "דיקור סיני", duration: 60, price: 300, color: "#f59e0b" },
      { name: "שיאצו", duration: 60, price: 260, color: "#ec4899" },
      { name: "טיפול באבנים חמות", duration: 75, price: 350, color: "#8b5cf6" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "painAreas", label: "אזורי כאב / מתח", type: "text", required: false, placeholder: "גב תחתון, צוואר, כתפיים..." },
      { id: "isFirstVisit", label: "ביקור ראשון?", type: "select", required: true, options: [
        { value: "", label: "בחר" },
        { value: "yes", label: "כן - זה הביקור הראשון שלי" },
        { value: "no", label: "לא - כבר הייתי בעבר" },
      ]},
      { id: "medicalConditions", label: "מצבים רפואיים רלוונטיים", type: "textarea", required: false, placeholder: "הריון, לחץ דם גבוה, סוכרת, ניתוחים אחרונים וכו'" },
    ],
  },
  tutoring: {
    id: "tutoring",
    label: "מורים פרטיים",
    icon: "📚",
    clientTerm: "תלמיד",
    clientTermPlural: "תלמידים",
    appointmentTerm: "שיעור",
    appointmentTermPlural: "שיעורים",
    serviceLabel: "בחר סוג שיעור",
    dateLabel: "בחר תאריך ושעה לשיעור",
    detailsLabel: "פרטי התלמיד",
    successMessage: "השיעור נקבע בהצלחה!",
    defaultServices: [
      { name: "שיעור מתמטיקה", duration: 60, price: 150, color: "#3b82f6" },
      { name: "שיעור אנגלית", duration: 60, price: 150, color: "#6366f1" },
      { name: "שיעור פיזיקה", duration: 60, price: 160, color: "#f59e0b" },
      { name: "הכנה לבגרות", duration: 90, price: 200, color: "#ef4444" },
      { name: "עזרה בשיעורי בית", duration: 45, price: 100, color: "#10b981" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם התלמיד", type: "text", required: true, placeholder: "שם מלא" },
      { id: "clientPhone", label: "טלפון (הורה/תלמיד)", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "gradeLevel", label: "כיתה", type: "select", required: true, options: [
        { value: "", label: "בחר כיתה" },
        { value: "elementary", label: "יסודי (א׳-ו׳)" },
        { value: "middle", label: "חטיבה (ז׳-ט׳)" },
        { value: "high", label: "תיכון (י׳-י״ב)" },
        { value: "university", label: "אקדמיה" },
        { value: "adult", label: "מבוגרים" },
      ]},
      { id: "subject", label: "מקצוע", type: "text", required: true, placeholder: "למשל: מתמטיקה 5 יח״ל" },
      { id: "notes", label: "הערות", type: "textarea", required: false, placeholder: "נושא ספציפי, קשיים, מטרות" },
    ],
  },
  pets: {
    id: "pets",
    label: "טיפוח כלבים / וטרינרים",
    icon: "🐾",
    clientTerm: "לקוח",
    clientTermPlural: "לקוחות",
    appointmentTerm: "תור",
    appointmentTermPlural: "תורים",
    serviceLabel: "בחר שירות",
    dateLabel: "בחר תאריך ושעה",
    detailsLabel: "פרטי בעל החיים",
    successMessage: "התור נקבע בהצלחה!",
    defaultServices: [
      { name: "רחצה וסירוק", duration: 60, price: 120, color: "#f59e0b" },
      { name: "תספורת מלאה", duration: 90, price: 200, color: "#6366f1" },
      { name: "גזירת ציפורניים", duration: 15, price: 40, color: "#10b981" },
      { name: "ניקוי אוזניים", duration: 15, price: 40, color: "#3b82f6" },
      { name: "בדיקת בריאות", duration: 30, price: 250, color: "#ef4444" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם בעל החיים", type: "text", required: true, placeholder: "שם הכלב/חתול" },
      { id: "clientPhone", label: "טלפון הבעלים", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "petType", label: "סוג חיה", type: "select", required: true, options: [
        { value: "", label: "בחר" },
        { value: "dog_small", label: "כלב קטן (עד 10 ק״ג)" },
        { value: "dog_medium", label: "כלב בינוני (10-25 ק״ג)" },
        { value: "dog_large", label: "כלב גדול (25+ ק״ג)" },
        { value: "cat", label: "חתול" },
        { value: "other", label: "אחר" },
      ]},
      { id: "breed", label: "גזע", type: "text", required: false, placeholder: "למשל: גולדן רטריבר" },
      { id: "notes", label: "הערות (אלרגיות, התנהגות מיוחדת)", type: "textarea", required: false, placeholder: "פרטים חשובים שנדע מראש" },
    ],
  },
  garage: {
    id: "garage",
    label: "מוסכים וטיפולי רכב",
    icon: "🔧",
    clientTerm: "לקוח",
    clientTermPlural: "לקוחות",
    appointmentTerm: "תור",
    appointmentTermPlural: "תורים",
    serviceLabel: "בחר סוג טיפול",
    dateLabel: "בחר תאריך ושעה",
    detailsLabel: "פרטי הרכב",
    successMessage: "התור נקבע בהצלחה! נא להגיע בזמן",
    defaultServices: [
      { name: "טסט שנתי", duration: 60, price: 250, color: "#ef4444" },
      { name: "החלפת שמן", duration: 30, price: 150, color: "#f59e0b" },
      { name: "בדיקת בלמים", duration: 45, price: 200, color: "#3b82f6" },
      { name: "טיפול 10,000 ק״מ", duration: 90, price: 500, color: "#6366f1" },
      { name: "אבחון תקלות", duration: 45, price: 180, color: "#10b981" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "carType", label: "יצרן ודגם", type: "text", required: true, placeholder: "למשל: טויוטה קורולה 2022" },
      { id: "licensePlate", label: "מספר רכב", type: "text", required: true, placeholder: "00-000-00" },
      { id: "notes", label: "תיאור התקלה / סוג הטיפול", type: "textarea", required: false, placeholder: "מה צריך לטפל? רעשים, נורות, בעיות ספציפיות" },
    ],
  },
  consulting: {
    id: "consulting",
    label: "ייעוץ מקצועי",
    icon: "💼",
    clientTerm: "לקוח",
    clientTermPlural: "לקוחות",
    appointmentTerm: "פגישה",
    appointmentTermPlural: "פגישות",
    serviceLabel: "בחר סוג שירות",
    dateLabel: "בחר תאריך ושעה לפגישה",
    detailsLabel: "פרטי הלקוח",
    successMessage: "הפגישה נקבעה בהצלחה!",
    defaultServices: [
      { name: "ייעוץ ראשוני", duration: 60, price: 400, color: "#3b82f6" },
      { name: "פגישת מעקב", duration: 45, price: 300, color: "#6366f1" },
      { name: "ייעוץ מקוון", duration: 30, price: 250, color: "#10b981" },
      { name: "סדנה אישית", duration: 120, price: 800, color: "#f59e0b" },
    ],
    bookingFields: [
      { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
      { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
      { id: "clientEmail", label: "אימייל", type: "email", required: true, placeholder: "email@example.com" },
      { id: "meetingFormat", label: "פורמט מועדף", type: "select", required: true, options: [
        { value: "", label: "בחר פורמט" },
        { value: "inperson", label: "פגישה פרונטלית" },
        { value: "online", label: "פגישה מקוונת (זום)" },
        { value: "phone", label: "שיחת טלפון" },
      ]},
      { id: "meetingTopic", label: "נושא הפגישה", type: "text", required: true, placeholder: "במה תרצה שנתמקד?" },
      { id: "notes", label: "מידע נוסף", type: "textarea", required: false, placeholder: "פרטים רלוונטיים, שאלות, חומרים להכין מראש" },
    ],
  },
};

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES.consulting;
}
