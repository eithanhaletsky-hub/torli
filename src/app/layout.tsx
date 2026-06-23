import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "תורלי - מערכת ניהול שיעורים למורים פרטיים",
  description: "מערכת הזמנת שיעורים, ניהול תלמידים ויומן חכם למורים פרטיים בישראל",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
