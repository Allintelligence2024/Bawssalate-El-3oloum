// « ملفّي » — la fiche A4 imprimable de l'élève.
//
// Elle ne note personne : elle rassemble ce que l'app sait déjà (progression, XP,
// kafaa, révisions, Bac) pour que l'élève puisse l'imprimer, la coller au mur ou
// l'envoyer à son professeur. Aucun pourcentage, aucune moyenne, aucune note /20.

import type { Etat } from '../types';
import { CHEMIN, TOTAL_LECONS } from '../data/programme';
import { aujourdhui, nb, formatJourAr, joursNb } from '../utils/dates';
import { joursConsecutifs, niveauDe, xpDe, xpTexte } from '../utils/xp';
import { joursAvantBac, revisionsDues } from '../utils/moteur';
import { WILAYA_PAR_CODE } from '../data/wilayas';
import { etapesFaites } from '../utils/bacPasAPas';
import { IcoRetour } from './Icones';

interface Props {
  etat: Etat;
  onFermer: () => void;
}

/** Les 7 derniers jours, du plus ancien au plus récent. */
function semaine(journal: string[]): { iso: string; actif: boolean }[] {
  const base = aujourdhui();
  const jours: { iso: string; actif: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(`${base}T12:00:00`);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    jours.push({ iso, actif: journal.includes(iso) });
  }
  return jours;
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rangee rangee--entre border-b border-line py-1.5 last:border-0">
      <span className="petit doux">{label}</span>
      <span className="text-sm font-bold text-ink tnum">{valeur}</span>
    </div>
  );
}

export default function FicheEleve({ etat, onFermer }: Props) {
  const xp = xpDe(etat);
  const niveau = niveauDe(xp);
  const lecons = Object.values(etat.progression).filter((p) => p.statut === 'terminee').length;
  const jalons = Object.values(etat.jalons).filter((j) => j.fait).length;
  const totalJalons = CHEMIN.filter((i) => i.type === 'jalon').length;
  const drills = Object.keys(etat.drills ?? {}).length;
  const kafaa = Object.values(etat.kafaa ?? {});
  const fragiles = kafaa.filter((k) => k.fragile).length;
  const dues = revisionsDues(etat).length;
  const bEtapes = etapesFaites(etat);
  const bExercices = Object.keys(etat.bacExercices ?? {}).length;
  const examens = etat.examens?.length ?? 0;
  const jours = joursConsecutifs(etat.journal);
  const restants = joursAvantBac(etat);
  const wilaya = etat.compte ? WILAYA_PAR_CODE[etat.compte.wilaya] : undefined;
  const actifs = semaine(etat.journal).filter((j) => j.actif).length;
  const pourcent = Math.round((lecons / Math.max(TOTAL_LECONS, 1)) * 100);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-10 pt-6">
      {/* Barre d'action — jamais imprimée */}
      <div className="sans-impression rangee rangee--entre mb-4">
        <button type="button" className="btn-mini" onClick={onFermer}>
          <span className="block h-3.5 w-3.5"><IcoRetour /></span> رجوع
        </button>
        <button type="button" className="btn btn--primaire" onClick={() => window.print()}>
          اطبع ورقة A4
        </button>
      </div>

      <article className="fiche-a4 mx-auto bg-paper p-8 text-ink shadow-sm">
        <header className="rangee rangee--entre border-b-2 border-primary pb-3">
          <div>
            <p className="oeil">بوصلة العلوم · علوم الطبيعة والحياة</p>
            <h1 className="titre-1 mt-1">ملفّي</h1>
          </div>
          <div className="text-left">
            <p className="petit doux">{formatJourAr(aujourdhui())}</p>
            <p className="petit doux">بكالوريا {etat.dateBac ? etat.dateBac.slice(0, 4) : '—'}</p>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
          <Ligne label="الاسم" valeur={etat.nom || '—'} />
          <Ligne label="الولاية" valeur={wilaya ? `${wilaya.nom} — ${etat.compte?.daira ?? ''}` : '—'} />
          <Ligne label="المستوى" valeur={niveau.nom} />
          <Ligne label="الخبرة" valeur={xpTexte(xp)} />
          <Ligne label="أيام متتالية" valeur={joursNb(jours)} />
          <Ligne
            label="على الامتحان"
            valeur={restants === null ? '—' : `${nb(Math.max(restants, 0))} يومًا`}
          />
        </section>

        <section className="mt-5">
          <div className="rangee rangee--entre">
            <h2 className="carte__titre">تقدّمي في الطريق</h2>
            <span className="mention mention--or tnum">
              {nb(lecons)} من {nb(TOTAL_LECONS)}
            </span>
          </div>
          <div className="jauge mt-2" aria-hidden="true">
            <div className="jauge__r" style={{ width: `${pourcent}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
            <Ligne label="دروس مُتمّمة" valeur={`${nb(lecons)} / ${nb(TOTAL_LECONS)}`} />
            <Ligne label="جسور مكتوبة" valeur={`${nb(jalons)} / ${nb(totalJalons)}`} />
            <Ligne label="تدريبات مُجابة" valeur={nb(drills)} />
            <Ligne label="أيام نشاط في الأسبوع" valeur={`${nb(actifs)} من 7`} />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4">
          <div className="carte">
            <p className="oeil">كفاءات المنهجية</p>
            <p className="carte__titre mt-1">{nb(kafaa.length)} بطاقة</p>
            <p className="petit doux mt-1">
              {fragiles > 0 ? `${nb(fragiles)} هشّة تُراجع أوّلًا` : 'ولا بطاقة هشّة حاليًّا'}
            </p>
          </div>
          <div className="carte">
            <p className="oeil">الاسترجاع المستحقّ</p>
            <p className="carte__titre mt-1">
              {dues === 0 ? 'ولا شيء اليوم' : `${nb(dues)} مراجعة`}
            </p>
            <p className="petit doux mt-1">المراجعة برنامج، ماشي اختبار.</p>
          </div>
          <div className="carte">
            <p className="oeil">الباك خطوة بخطوة</p>
            <p className="carte__titre mt-1">{nb(bEtapes)} خطوة</p>
            <p className="petit doux mt-1">
              {nb(bExercices)} تمرينًا كاملًا · {nb(examens)} امتحانًا تجريبيًّا
            </p>
          </div>
          <div className="carte">
            <p className="oeil">آخر 7 أيام</p>
            <div className="mt-2 flex flex-nowrap items-center gap-1.5">
              {semaine(etat.journal).map((j) => (
                <span
                  key={j.iso}
                  title={j.iso}
                  className={`h-3.5 w-3.5 rounded-full border ${
                    j.actif ? 'border-primary bg-primary' : 'border-line bg-paper'
                  }`}
                />
              ))}
            </div>
            <p className="petit doux mt-2">نقطة ملوّنة = يوم عملت فيه.</p>
          </div>
        </section>

        <section className="mt-5">
          <h2 className="carte__titre">تعهّد شخصي</h2>
          <p className="petit mt-1 leading-relaxed">
            نخدم كلّ يوم شوية، بلا مقارنة وبلا علامة على 20. اللي نغلط فيه نكتبو، واللي نتقنّو
            نراجعوه في وقتو. الباك ماشي سباق — هو نتيجة طريق.
          </p>
          <div className="rangee rangee--entre mt-6">
            <span className="petit doux">التوقيع: ..........................</span>
            <span className="petit doux">التاريخ: ..........................</span>
          </div>
        </section>

        <footer className="mt-6 border-t border-line pt-2">
          <p className="petit doux">
            بوصلة العلوم
            {etat.compte ? ` · عضو منذ ${formatJourAr(etat.compte.creeLe.slice(0, 10))}` : ''} —
            ورقة عمل شخصية، ماشي شهادة. لا علامة على 20.
          </p>
        </footer>
      </article>
    </div>
  );
}
