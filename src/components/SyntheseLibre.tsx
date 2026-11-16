// السَّمْيَة الْحُرَّة — PHASE 1.3 · التغزل الحر للنصوص
// Résumé : situation Bac → saisie clavier libre → auto-évaluation guidée
// (l'élève coche ce qu'il a réellement produit) → modèle + erreur nucléaire
// → carte kafaa SM-2. Aucune note machine.
//
// Dépôt progressif : U1, U4, U6, U9 (S2) puis U2, U3, U5, U7, U8, U9, U10, U11 (S3).
// Chaque tâche = un scénario défini à l'avance, signé par l'enseignant.
//
// Principes OPUS :
//   - Aucune note machine, aucun pourcentage, aucune comparaison sociale.
//   - Le modèle est un support d'auto-évaluation, jamais un barème.
//   - L'erreur nucléaire est toujours visible, jamais surprise.

import { useState } from 'react';
import type { CarteKafaa } from '../types';
import { ajouterJours, aujourdhui } from '../utils/dates';
import { mettreAJourSrs } from '../utils/srs';
import MascotteKunz from './MascotteKunz';

interface Props {
  // Université dépositaire (U1, U4, U6…)
  uniteId: string;
  // Titre du sujet Bac
  sujet: string;
  // Question de déclenchement
  question: string;
  // Modèle Auteur (tuiles) — ce qui attendu dans la réponse
  modele: string[];
  // Les pièges à éviter (vus comme des pistes de révision)
  pièges: string[];
  // Diagnostic de la brouille (T1–T4)
  diagnostic: { id: string; ar: string };
  // Callback SM-2 — enregistre la carte kafaa
  onResultatKafaa?: (key: string, qualite: 1 | 2 | 3, meta: { verbe: string; exercice: string; erreur: string }) => void;
  // Callback carnet d'erreurs (optionnel)
  onCarnetFaute?: (f: { contexte: string; enonce: string; donne: string; diagnostic: string }) => void;
  onFermer: () => void;
}

type Etape = 'situation' | 'saisie' | 'auto' | 'modele' | 'resultat';

export default function SyntheseLibre({
  uniteId,
  sujet,
  question,
  modele,
  pièges,
  diagnostic,
  onResultatKafaa,
  onCarnetFaute,
  onFermer,
}: Props) {
  const [etape, setEtape] = useState<Etape>('situation');
  const [saisie, setSaisie] = useState('');
  const [autoCochees, setAutoCochees] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState<string | null>(null);

  function handleAutoChange(id: string, checked: boolean) {
    setAutoCochees((prev) => ({ ...prev, [id]: checked }));
  }

  function valider() {
    if (!saisie.trim()) {
      setNote('اكتب نصك أولاً ثم ابدأ التقييم الذاتي.');
      return;
    }
    setEtape('auto');
  }

  function validerAuto() {
    // Évaluation guidée : le nombre de cases cochées sert de seuil, pas de note
    const coches = Object.values(autoCochees).filter(Boolean).length;
    if (coches === 0) {
      setNote('وضع علامة على ما أنتجته فعليًا، قبل التسلّق.');
      return;
    }
    // Carte kafaa SM-2 (quals track: self-grader, no machine score)
    const key = `methodo${uniteId}`;
    const carte: CarteKafaa = {
      verbe: question.split(' ')[0] ?? 'استنتج',
      exercice: sujet,
      erreur: pièges[0] ?? 'الإجابة المسحة دون دليل',
      repetitions: 1,
      intervalle: 3,
      facilite: 2.5,
      prochaineRevision: ajouterJours(aujourdhui(), 3),
      fragile: false,
    };
    onResultatKafaa?.(key, 2, carte);
    // Trace anti-stress : jamais la bonne réponse dans le carnet
    onCarnetFaute?.({
      contexte: `السَّمْيَة الْحُرَّة · ${uniteId}`,
      enonce: question,
      donne: saisie.slice(0, 120) + (saisie.length > 120 ? '…' : ''),
      diagnostic: diagnostic.id,
    });
    setNote('أكملت التقييم الذاتي. نقاط القوة والضعف مُدونة في أنا → الفرص.');
    setEtape('resultat');
  }

  const etapeLibelle =
    etape === 'situation'
      ? 'الوضعية'
      : etape === 'saisie'
      ? 'التَّرْجِمَة'
      : etape === 'auto'
      ? 'التَّقْدِير الْمُسَاعَد'
      : etape === 'modele'
      ? 'مُدَلِّك'
      : 'النَّتِيجَة';

  return (
    <div className="fixed inset-0 z-[80] overflow-auto bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <button onClick={onFermer} className="btn btn-ghost mb-6">
          <span className="block h-5 w-5"><MascotteKunz message="إغلاق" compact tone="paper" /></span>
          خروج من النص الحر
        </button>

        {etape === 'situation' && (
          <section className="card p-6">
            <p className="eyebrow">السَّمْيَة الْحُرَّة · {uniteId}</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{sujet}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">{question}</p>
            <button onClick={() => setEtape('saisie')} className="btn btn-primary mt-6">
              ابدأ الكتابة ←
            </button>
          </section>
        )}

        {etape === 'auto' && (
          <section className="card p-6">
            <p className="eyebrow">{etapeLibelle}</p>
            <p className="text-sm leading-relaxed text-mute">
              صدق، واقرأ سؤالك مرّتين. ثم أشرَ إلى ما أنتجته فعلاً (بدون حكم، بدون مَغْلَب).
              « نعم، كتبت تعريفاً » لا « نعم، فهمت الدرس ».
            </p>
            <div className="mt-4 space-y-2">
              {modele.map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-3 text-sm leading-relaxed"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(autoCochees[item.slice(0, 30)])}
                    onChange={(e) => handleAutoChange(item.slice(0, 30), e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line"
                  />
                  <span className="text-forest-deep">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <button onClick={validerAuto} className="btn btn-primary">
                متابعَة ←
              </button>
              {note && <p className="text-sm font-bold text-clay">{note}</p>}
            </div>
          </section>
        )}

        {etape === 'modele' && (
          <section className="card p-6">
            <p className="eyebrow">مُدَلِّك — لا للنسخ، لِلْمقارَنَة</p>
            <p className="text-sm text-mute">
              اقرأ النموذج، ثم أعِد كتابة عناصرك على أساس ما لاحظته. النموذج لا يُقدَّم لغويًا،
              بل لبناء المعنى.
            </p>
            <ol className="mt-4 list-decimal list-inside text-sm leading-relaxed text-forest-deep">
              {modele.map((item, i) => (
                <li key={i} className="mb-2">
                  {item}
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl border border-clay-soft bg-clay-soft/40 p-4 text-sm text-clay">
              <p className="font-bold text-clay">الخطأ النووي — لا تنسخه وانت</p>
              <p className="mt-1">{diagnostic.ar}</p>
              <p className="mt-2 text-xs">الخطر: نسخ النموذج دون فهم. الإجابة الصحيحة تعتمد على هذا السؤال، وليس على نموذج باعد.</p>
            </div>
            <div className="mt-5">
              <button onClick={() => setEtape('resultat')} className="btn btn-primary">
                أنتِ ننتج ←
              </button>
            </div>
          </section>
        )}

        {etape === 'resultat' && (
          <section className="card p-6">
            <p className="eyebrow">النَّتِيجَة</p>
            <div className="rounded-2xl bg-sage-soft p-5 text-sm leading-relaxed text-forest-deep">
              <p className="font-bold text-forest-deep">مَكْتُوبٌ.</p>
              <p className="mt-2">أشرْتَ على {Object.values(autoCochees).filter(Boolean).length} عنصر على الأقل. الخطأ النووي سُجِّل في سجلّ الأخطاء للمراجعة لاحقاً.</p>
              <p className="mt-2 text-xs text-mute">
                {diagnostic.id === 'T1'
                  ? 'مصطلح: ركّز على الصياغة العلمية في الحصص القادمة.'
                  : diagnostic.id === 'T2'
                  ? 'تسلسل: حافظ على منطق السببية في كتابتك.'
                  : diagnostic.id === 'T3'
                  ? 'دليل: ستحتاج إلى التدرب على ربط المعطيات بالدرس.'
                  : 'إنتاج: اكتب جملة كاملة أنت من تصنعها، بدون نموذج لفترتين.'}
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={onFermer} className="btn btn-primary flex-1">
                إنهاء
              </button>
              <button onClick={() => setEtape('auto')} className="btn flex-1">
                إعادة التَّقْدِير ←
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
