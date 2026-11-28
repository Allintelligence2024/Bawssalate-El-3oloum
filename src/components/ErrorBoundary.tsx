// حاجز أخطاء عام — يمنع الشاشة البيضاء عند خطأ عرض غير متوقّع مع حفظ إمكانية استخراج نسخة احتياطية.

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CLE_ETAT } from '../utils/storage';

interface Props {
  children: ReactNode;
  onRetour?: () => void;
}

interface State {
  enErreur: boolean;
  exportEffectue: boolean;
}

function telechargerSecoursLocal(): boolean {
  try {
    const brut = localStorage.getItem(CLE_ETAT);
    if (!brut) return false;
    const blob = new Blob([brut], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bousala-secours-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { enErreur: false, exportEffectue: false };

  static getDerivedStateFromError(): State {
    return { enErreur: true, exportEffectue: false };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // لا نُرسل شيئًا إلى أي خادم: نكتفي بوضع الواجهة في حالة استعادة آمنة.
  }

  reessayer = () => {
    this.setState({ enErreur: false, exportEffectue: false });
    if (this.props.onRetour) {
      this.props.onRetour();
    } else {
      window.location.reload();
    }
  };

  exporterSecours = () => {
    const ok = telechargerSecoursLocal();
    if (ok) this.setState({ exportEffectue: true });
  };

  render(): ReactNode {
    if (!this.state.enErreur) return this.props.children;
    return (
      <main dir="rtl" role="alert" className="grid min-h-dvh place-items-center bg-cream px-4 py-8">
        <section className="card w-full max-w-md p-6 text-right">
          <p className="eyebrow">بوصلة العلوم</p>
          <h1 className="font-naskh mt-1 text-2xl font-black text-forest-deep">
            توقّف العرض مؤقّتًا
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            حدث خلل غير متوقّع في هذه الشاشة. بياناتك وتقدّمك المحفوظ على هذا الجهاز لم يُمسّا.
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={this.reessayer}
              className="btn btn-primary w-full text-sm"
            >
              {this.props.onRetour ? 'العودة إلى الشاشة السابقة' : 'إعادة فتح التطبيق'}
            </button>
            <button
              type="button"
              onClick={this.exporterSecours}
              className="btn btn-ghost w-full border border-line text-sm"
            >
              تصدير نسخة احتياطية سريعة
            </button>
          </div>
          {this.state.exportEffectue && (
            <p className="mt-3 text-xs font-bold text-forest">
              تمّ تنزيل نسخة من بياناتك المحلّية بنجاح.
            </p>
          )}
        </section>
      </main>
    );
  }
}
