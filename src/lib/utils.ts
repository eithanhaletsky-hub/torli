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

const tutoringBookingFields: BookingField[] = [
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
  { id: "notes", label: "הערות", type: "textarea", required: false, placeholder: "נושא ספציפי, קשיים, מטרות" },
];

const tutoringBase = {
  clientTerm: "תלמיד",
  clientTermPlural: "תלמידים",
  appointmentTerm: "שיעור",
  appointmentTermPlural: "שיעורים",
  dateLabel: "בחר תאריך ושעה",
  detailsLabel: "פרטי התלמיד",
  successMessage: "השיעור נקבע בהצלחה! נתראה 📚",
  bookingFields: tutoringBookingFields,
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  math: {
    id: "math",
    label: "מתמטיקה",
    icon: "📐",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "מתמטיקה 3 יח״ל", duration: 60, price: 120, color: "#6366f1" },
      { name: "מתמטיקה 4 יח״ל", duration: 60, price: 140, color: "#8b5cf6" },
      { name: "מתמטיקה 5 יח״ל", duration: 60, price: 160, color: "#a855f7" },
    ],
  },
  physics: {
    id: "physics",
    label: "פיזיקה",
    icon: "🔬",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "פיזיקה 5 יח״ל", duration: 60, price: 160, color: "#3b82f6" },
      { name: "מכניקה", duration: 60, price: 140, color: "#0ea5e9" },
      { name: "חשמל ומגנטיות", duration: 60, price: 140, color: "#06b6d4" },
    ],
  },
  english: {
    id: "english",
    label: "אנגלית",
    icon: "🇬🇧",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "אנגלית 3 יח״ל", duration: 60, price: 120, color: "#ef4444" },
      { name: "אנגלית 4 יח״ל", duration: 60, price: 140, color: "#f97316" },
      { name: "אנגלית 5 יח״ל", duration: 60, price: 160, color: "#f59e0b" },
    ],
  },
  hebrew: {
    id: "hebrew",
    label: "עברית ולשון",
    icon: "📖",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "הבנת הנקרא", duration: 60, price: 120, color: "#10b981" },
      { name: "חיבור ולשון", duration: 60, price: 120, color: "#14b8a6" },
      { name: "עברית בגרות", duration: 60, price: 140, color: "#059669" },
    ],
  },
  cs: {
    id: "cs",
    label: "מדעי המחשב",
    icon: "💻",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "מדעי המחשב 5 יח״ל", duration: 60, price: 160, color: "#8b5cf6" },
      { name: "Java / Python", duration: 60, price: 150, color: "#7c3aed" },
      { name: "מבני נתונים", duration: 60, price: 160, color: "#6d28d9" },
    ],
  },
  chemistry: {
    id: "chemistry",
    label: "כימיה",
    icon: "🧪",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "כימיה 5 יח״ל", duration: 60, price: 160, color: "#ec4899" },
      { name: "כימיה אורגנית", duration: 60, price: 150, color: "#d946ef" },
    ],
  },
  history: {
    id: "history",
    label: "היסטוריה ואזרחות",
    icon: "🌍",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "היסטוריה בגרות", duration: 60, price: 120, color: "#f59e0b" },
      { name: "אזרחות", duration: 60, price: 120, color: "#eab308" },
    ],
  },
  music: {
    id: "music",
    label: "מוזיקה",
    icon: "🎵",
    ...tutoringBase,
    serviceLabel: "בחר כלי / סגנון",
    defaultServices: [
      { name: "פסנתר", duration: 45, price: 130, color: "#6366f1" },
      { name: "גיטרה", duration: 45, price: 120, color: "#f97316" },
      { name: "תיאוריה מוזיקלית", duration: 45, price: 100, color: "#8b5cf6" },
    ],
  },
  art: {
    id: "art",
    label: "אמנות ועיצוב",
    icon: "🎨",
    ...tutoringBase,
    serviceLabel: "בחר סוג שיעור",
    defaultServices: [
      { name: "ציור ורישום", duration: 60, price: 110, color: "#ec4899" },
      { name: "עיצוב גרפי", duration: 60, price: 140, color: "#f43f5e" },
    ],
  },
  general: {
    id: "general",
    label: "כללי / אחר",
    icon: "📚",
    ...tutoringBase,
    serviceLabel: "בחר מקצוע",
    defaultServices: [
      { name: "שיעור פרטי", duration: 60, price: 120, color: "#6366f1" },
      { name: "הכנה למבחן", duration: 90, price: 180, color: "#8b5cf6" },
    ],
  },
};

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES.general;
}
