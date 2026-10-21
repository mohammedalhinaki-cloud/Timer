import React from 'react';
import { X, ShieldCheck, FileText, Mail, Heart, HelpCircle } from 'lucide-react';
import { ThemeConfig } from '../types/theme';

export type InfoModalType = 'privacy' | 'terms' | 'about' | 'shortcuts' | null;

interface InfoModalsProps {
  type: InfoModalType;
  onClose: () => void;
  theme: ThemeConfig;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ type, onClose, theme }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border text-right max-h-[88vh] overflow-y-auto ${theme.surfaceBg} ${theme.surfaceBorder}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              {type === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'about' && <Heart className="w-5 h-5" />}
              {type === 'shortcuts' && <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme.timerTextColor}`}>
                {type === 'privacy' && 'سياسة الخصوصية وحماية البيانات'}
                {type === 'terms' && 'شروط الاستخدام والتواصل'}
                {type === 'about' && 'عن تينڤيلو (Tenvylo)'}
                {type === 'shortcuts' && 'اختصارات لوحة المفاتيح والتحكم'}
              </h2>
              <span className="text-xs text-slate-400">مؤقت المذاكرة والتركيز الفاخر</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on type */}
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
          {type === 'privacy' && (
            <>
              <p>
                نولي في <strong>تينڤيلو (Tenvylo)</strong> خصوصيتك أقصى درجات الاحترام والأهمية. تم تصميم هذا الموقع ليعمل بكفاءة فائقة دون جمع أو تخزين أي بيانات شخصية حساسة على أي خوادم خارجية.
              </p>

              <h4 className="font-bold text-slate-100 text-sm mt-3">1. البيانات المخزنة محليًا (Local Storage)</h4>
              <p>
                جميع إحصائيات المذاكرة، وتاريخ الجلسات، واختيارات المظهر والسمات، والمدة المتبقية للمؤقت، تُحفظ حصرًا داخل متصفح جهازك باستخدام تقنية التخزين المحلي (localStorage). لا يتم إرسال أي من هذه المعلومات إلى أي خادم، وتظل تحت تحكمك الكامل ويمكنك حذفها أو تصفيرها في أي وقت بنقرة زر واحدة.
              </p>

              <h4 className="font-bold text-slate-100 text-sm mt-3">2. ملفات تعريف الارتباط والإعلانات</h4>
              <p>
                قد نستخدم في المستقبل شبكات إعلانية معتمدة مثل Google AdSense لعرض إعلانات غير مزعجة تساعد في استمرارية وتطوير الموقع مجانًا للطلاب والباحثين. تستخدم هذه الشبكات ملفات تعريف الارتباط (Cookies) لعرض إعلانات ملائمة بناءً على زيارات المستخدم السابقة.
              </p>
              <p className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/30 text-cyan-200 text-xs">
                <strong>تعهد التركيز الصارم:</strong> يضمن موقع تينڤيلو اختفاء جميع المساحات الإعلانية فور بدء جلسة المذاكرة، ولن تظهر أي إعلانات أمامك أثناء فترة التركيز أو الإيقاف المؤقت إطلاقًا.
              </p>

              <h4 className="font-bold text-slate-100 text-sm mt-3">3. أذونات المتصفح</h4>
              <p>
                يطلب الموقع إذن «منع إيقاف الشاشة» (Wake Lock) لضمان عدم انطفاء شاشة جهازك أثناء المذاكرة، وإذن «الإشعارات» لتنبيهك عند اكتمال الجلسة في حال كنت في تبويب آخر. جميع هذه الأذونات اختيارية تمامًا ولا تُستخدم إلا للغرض المصرح به.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                باستخدامك لموقع <strong>تينڤيلو (Tenvylo)</strong>، فإنك توافق على الالتزام بالشروط البسيطة التالية:
              </p>

              <h4 className="font-bold text-slate-100 text-sm mt-3">1. الاستخدام المشروع</h4>
              <p>
                تم تطوير الموقع لمساعدة الطلاب والمهنيين على التركيز وزيادة الإنتاجية وإدارة أوقات الدراسة. يُحظر استخدام الموقع في أي أنشطة غير مشروعة أو محاولات إضرار بالخدمة.
              </p>

              <h4 className="font-bold text-slate-100 text-sm mt-3">2. إخلاء المسؤولية</h4>
              <p>
                يُقدم الموقع «كما هو» وبشكل مجاني كليًا، ونسعى دائمًا لضمان أعلى مستويات الدقة والاستقرار وتوافق الأجهزة.
              </p>

              <h4 className="font-bold text-slate-100 text-sm mt-3">3. التواصل والدعم الفني</h4>
              <p>
                لأي استفسارات، أو اقتراحات لتطوير الموقع، أو شراكات إعلانية، يمكنك التواصل معنا عبر البريد الإلكتروني:
              </p>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-cyan-300 font-mono text-xs">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>support@tenvylo.app</span>
                <span className="text-[10px] text-slate-500 font-sans mr-auto">(قابلة للتخصيص من الإدارة)</span>
              </div>
            </>
          )}

          {type === 'about' && (
            <>
              <p>
                <strong>تينڤيلو (Tenvylo)</strong> هو مؤقت مذاكرة استثنائي تم تصميمه للمتعلمين والباحثين الذين يبحثون عن الصفاء الذهني وتجربة بصرية تحفز على الاستمرار.
              </p>
              <p>
                استوحينا فلسفة التصميم من بساطة أجهزة Apple وهدوء جلسات التأمل، ليكون رفيقك اليومي في تحقيق التفوق والوصول إلى أقصى درجات التدفق والتركيز العميق (Deep Work).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="font-semibold text-slate-200 text-xs mb-1">دقة زمنية مطلقة</div>
                  <div className="text-xs text-slate-400">مبني على Timestamps الحقيقية ليعمل حتى عند إغلاق التبويب أو نوم الجهاز.</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="font-semibold text-slate-200 text-xs mb-1">صفر تشتيت</div>
                  <div className="text-xs text-slate-400">وضع تركيز غامر يخفي كل العناصر الزائدة والإعلانات لتحيطك السكينة فقط.</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="font-semibold text-slate-200 text-xs mb-1">سمات فاخرة</div>
                  <div className="text-xs text-slate-400">7 سمات مخصصة تلائم ذوقك من الأسود المطلق AMOLED إلى المحيط والغروب.</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="font-semibold text-slate-200 text-xs mb-1">تطبيق PWA مستقل</div>
                  <div className="text-xs text-slate-400">يعمل بدون إنترنت بعد التحميل الأول، ويمكن تثبيته على هاتفك وحاسوبك.</div>
                </div>
              </div>
            </>
          )}

          {type === 'shortcuts' && (
            <>
              <p>
                يمكنك التحكم الكامل في جلسة المذاكرة أثناء وضع التركيز باستخدام لوحة المفاتيح:
              </p>
              <div className="space-y-2 mt-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-200">إيقاف مؤقت / استئناف الجلسة</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 font-mono text-xs border border-white/10">Space (المسافة)</kbd>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-200">التبديل إلى وضع ملء الشاشة</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 font-mono text-xs border border-white/10">F</kbd>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-200">كتم / تفعيل نغمة الانتهاء الهادئة</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 font-mono text-xs border border-white/10">M</kbd>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-200">إنهاء الجلسة أو العودة</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 font-mono text-xs border border-white/10">Escape (Esc)</kbd>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-xs transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
