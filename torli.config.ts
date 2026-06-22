import type { BookingField } from "@/lib/utils";

export const config = {
  business: {
    name: "שם העסק שלך",
    description: "תיאור קצר של העסק",
    phone: "050-1234567",
    address: "הכתובת שלך",
    primaryColor: "#6366f1",
  },

  owner: {
    name: "שם בעל העסק",
    email: "owner@example.com",
    password: "change-me-123",
  },

  terminology: {
    clientTerm: "לקוח",
    clientTermPlural: "לקוחות",
    appointmentTerm: "תור",
    appointmentTermPlural: "תורים",
    serviceLabel: "בחר שירות",
    dateLabel: "בחר תאריך ושעה",
    detailsLabel: "פרטי הלקוח",
    successMessage: "התור נקבע בהצלחה!",
  },

  defaultServices: [
    { name: "שירות לדוגמה", duration: 60, price: 200, color: "#6366f1" },
  ],

  businessHours: [
    { dayOfWeek: 0, startTime: "09:00", endTime: "18:00", isOpen: true },
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isOpen: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isOpen: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isOpen: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isOpen: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "14:00", isOpen: true },
    { dayOfWeek: 6, startTime: "00:00", endTime: "00:00", isOpen: false },
  ],

  bookingFields: [
    { id: "clientName", label: "שם מלא", type: "text", required: true, placeholder: "השם שלך" },
    { id: "clientPhone", label: "טלפון", type: "tel", required: true, placeholder: "050-1234567" },
    { id: "notes", label: "הערות", type: "textarea", required: false, placeholder: "הערות נוספות" },
  ] as BookingField[],
};
