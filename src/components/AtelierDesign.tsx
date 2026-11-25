// أتيلييه التصميم — route de développement `?design=1`
//
// Elle affiche le vocabulaire « maquette » (cartes, badges, boutons, pastilles,
// typographie) sur la vraie palette, pour vérifier la cohérence avant de porter
// un écran. Elle n'est chargée qu'en développement et ne touche à aucune donnée.

import { useEffect, useState } from 'react';
import { DOMAINES, UNITE_PAR_ID } from '../data/programme';
import { nb } from '../utils/dates';

const EXEMPLES = {
  mentions: ['افتح', 'جاهزة', '3 من 8', 'بلا وقت', 'دليل'],
};

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="carte mb-4">
      <div className="carte__tete mb-3">
        <h2 className="carte__titre">{titre}</h2>
        <span className="mention mention--or">كتلة</span>
      </div>
      {children}
    </section>
  );
}

export default function AtelierDesign() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('design_theme') as 'light' | 'dark') ?? 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('design_theme', theme);
  }, [theme]);

  return (
    <div dir="rtl" className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="oeil">مرحلة 0 · أساس التصميم</p>
          <h1 className="titre-1">أتيلييه التصميم</h1>
          <p className="petit doux mt-1">كل مكوّنات البوصلة في بلاصة واحدة — للتّحقق قبل ما نبدّل أي شاشة.</p>
        </div>
        <button
          type="button"
          className="btn-mini"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        >
          {theme === 'light' ? 'الليل' : 'النهار'}
        </button>
      </header>

      <Bloc titre="الخطوط">
        <p className="oeil">عَيْن · oeii</p>
        <p className="titre-1 mt-1">3 دقائق، وتفهم خطوة.</p>
        <p className="petit mt-2">نصّ عادي 13.5px — نقاط واضحة، سطور مرتاحة.</p>
        <p className="petit doux">نصّ ثانوي باهت قليلًا.</p>
      </Bloc>

      <Bloc titre="البطاقات">
        <div className="carte mb-2">
          <div className="carte__tete">
            <span className="carte__titre">بطاقة بسيطة</span>
            <span className="mention mention--vert">جاهزة</span>
          </div>
          <p className="petit mt-1">سطر شرح قصير، بلا زخرفة زايدة.</p>
        </div>
        <div className="carte carte__ligne">
          <div className="carte__texte">
            <p className="carte__titre">بطاقة مضغوطة</p>
            <p className="petit doux">سطر واحد + زر صغير</p>
          </div>
          <button type="button" className="btn-mini">افتح</button>
        </div>
      </Bloc>

      <Bloc titre="الأزرار">
        <div className="colonne flex flex-col gap-2">
          <button type="button" className="btn btn--primaire">زرّ أساسي</button>
          <button type="button" className="btn btn--secondaire">زرّ ثانوي</button>
          <button type="button" className="btn btn--primaire" disabled>زرّ معطّل (بلا فعل)</button>
          <div className="rangee rangee--galerie">
            <button type="button" className="btn-mini">افتح</button>
            <button type="button" className="btn-mini" disabled>مسدود</button>
          </div>
        </div>
      </Bloc>

      <Bloc titre="الإشارات">
        <div className="rangee rangee--galerie">
          <span className="mention">عادي</span>
          <span className="mention mention--or">مفخّ</span>
          <span className="mention mention--vert">صحيح</span>
          <span className="puce">بلا وقت</span>
        </div>
        <div className="rangee rangee--entre mt-3">
          <span className="oeil">خطوة 2 من 6</span>
          <span className="mention mention--or">C4</span>
        </div>
        <hr className="filet" />
        <p className="petit doux">الخطأ يتلوّن بالعسل، ولا يوجد أحمر في التعلّم.</p>
      </Bloc>

      <Bloc titre="مسار الوحدات — بيانات حقيقية">
        <p className="petit doux mb-3">
          نفس محتوى «مساري» في التطبيق (11 وحدة، 58 درسًا)، لكن باللغة البصرية الجديدة.
        </p>
        <div className="flex flex-col gap-2">
          {DOMAINES.flatMap((d) =>
            d.unites.map((uid) => {
              const u = UNITE_PAR_ID[uid];
              return (
                <div key={uid} className="carte carte__ligne">
                  <span className="mention mention--vert tnum" aria-hidden="true">
                    {nb(u.numero)}
                  </span>
                  <div className="carte__texte mx-2 flex-1">
                    <p className="carte__titre">{u.titre}</p>
                    <p className="petit doux">
                      {nb(u.lessonIds.length)} دروس · {u.fenetreAr}
                    </p>
                  </div>
                  <button type="button" className="btn-mini" aria-label={`افتح ${u.titre}`}>
                    افتح
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Bloc>

      <p className="petit doux center text-center">
        {EXEMPLES.mentions.join(' · ')}
      </p>
    </div>
  );
}
