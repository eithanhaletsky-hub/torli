import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  Smartphone,
  QrCode,
  Download,
  Shield,
  Zap,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Star,
} from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const features = [
    {
      icon: Calendar,
      title: "יומן שיעורים חכם",
      desc: "ניהול שיעורים ויומן שבועי עם תצוגה ברורה. התלמידים קובעים, אתה רואה הכל במקום אחד.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Users,
      title: "ניהול תלמידים",
      desc: "מאגר תלמידים מלא עם היסטוריית שיעורים, טלפון הורים, כיתה, הערות ומעקב אישי.",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Smartphone,
      title: "הזמנת שיעור אונליין",
      desc: "דף הזמנה מותאם. התלמידים בוחרים מקצוע, תאריך ושעה - והשיעור נכנס ליומן שלך.",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Clock,
      title: "שעות זמינות",
      desc: "הגדר ימים ושעות שאתה מלמד. המערכת מציגה לתלמידים רק שעות פנויות.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: QrCode,
      title: "QR Code + שיתוף",
      desc: "קוד QR להדפסה וקישור לשיתוף בוואטסאפ עם הורים ותלמידים.",
      color: "bg-pink-50 text-pink-600",
    },
    {
      icon: Download,
      title: "ייצוא נתונים",
      desc: "ייצוא שיעורים ותלמידים לקובץ CSV לעבודה עם Excel או Google Sheets.",
      color: "bg-cyan-50 text-cyan-600",
    },
  ];

  const subjects = [
    { icon: "📐", label: "מתמטיקה" },
    { icon: "🔬", label: "פיזיקה" },
    { icon: "🇬🇧", label: "אנגלית" },
    { icon: "📖", label: "עברית ולשון" },
    { icon: "💻", label: "מדעי המחשב" },
    { icon: "🧪", label: "כימיה" },
    { icon: "🌍", label: "היסטוריה ואזרחות" },
    { icon: "🎵", label: "מוזיקה" },
    { icon: "🎨", label: "אמנות ועיצוב" },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="fixed top-0 right-0 left-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">תורלי</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
              התחברות
            </Link>
            <Link href="/register" className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition">
              התחל בחינם
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            מערכת ניהול שיעורים למורים פרטיים
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            התלמידים קובעים שיעורים
            <br />
            <span className="text-primary-600">בלי שיחות טלפון</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            תורלי נותנת לך מערכת הזמנת שיעורים מקצועית, יומן חכם,
            וניהול תלמידים - הכל במקום אחד, בעברית, ובלי מנוי חודשי.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl text-lg font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-200"
            >
              התחל עכשיו - בחינם
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl text-lg font-medium hover:border-gray-300 transition"
            >
              איך זה עובד?
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> בלי מנוי חודשי</span>
            <span>·</span>
            <span>התקנה תוך דקות</span>
            <span>·</span>
            <span>בעברית מלאה</span>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">הכל מה שמורה פרטי צריך</h2>
            <p className="text-gray-500 text-lg">מערכת מלאה לניהול שיעורים ותלמידים, בלי מערכות מסובכות</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition">
                  <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" id="subjects">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">מתאים לכל מקצוע</h2>
            <p className="text-gray-500 text-lg">לא משנה מה אתה מלמד — המערכת מותאמת בדיוק לצרכים שלך</p>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-5">
            {subjects.map((sub) => (
              <div
                key={sub.label}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100"
              >
                <span className="text-3xl">{sub.icon}</span>
                <h3 className="font-bold text-gray-900">{sub.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50" id="how">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">איך זה עובד?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "הירשם והגדר מקצועות", desc: "צור חשבון, הוסף את המקצועות שאתה מלמד, והמערכת תיצור לך דף הזמנה מותאם." },
              { step: "2", title: "שתף עם תלמידים והורים", desc: "שלח את קישור ההזמנה או ה-QR Code בוואטסאפ. תלמידים בוחרים מקצוע, יום ושעה." },
              { step: "3", title: "נהל את היומן שלך", desc: "כל השיעורים מופיעים ביומן. ראה מי קבע, מתי, באיזה מקצוע — והכל מסודר." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">מוכן להפסיק לתאם שיעורים בוואטסאפ?</h2>
            <p className="text-primary-100 text-lg mb-8">
              תנו לתלמידים לקבוע שיעורים לבד, 24/7, בלי הודעות הלוך-חזור.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-2xl text-lg font-bold hover:bg-primary-50 transition"
            >
              התחל עכשיו
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <p className="text-primary-200 text-sm mt-4">ללא מנוי חודשי · ללא עלויות נסתרות</p>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-primary-600">תורלי</span>
          <p className="text-sm text-gray-400">מערכת ניהול שיעורים למורים פרטיים בישראל</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-700">התחברות</Link>
            <Link href="/register" className="hover:text-gray-700">הרשמה</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
