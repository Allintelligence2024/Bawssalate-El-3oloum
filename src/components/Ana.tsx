// أنا — الكرّاسة، الهوية، الإحصاء بالحروف (لا نسب مئوية)، وسجلّ النشاط.

import { useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { Etat, NoteCarnet, FauteCarnet, Objectif, TailleTexte } from '../types';
import { paquetExportComplet } from '../utils/storage';
import { lireSauvegarde, normaliserSauvegarde } from '../utils/backup';
import type { StatsReponses } from '../utils/stats';
import { itemsFaits } from '../utils/moteur';
import { aujourdhui, differenceJours, nb, nbMin, formatCourteAr, formatJourAr, joursNb } from '../utils/dates';
import { joursConsecutifs, niveauDe, xpDe, xpTexte } from '../utils/xp';
import { WILAYA_PAR_CODE } from '../data/wilayas';
import { CHEMIN } from '../data/programme';
import { Morceau } from './Communs';
import CarteStats from './CarteStats';
import { ReglageSync } from './CarteSync';
import ReglagesParcours from './ReglagesParcours';
import CarteDiagnosticFavoris from './CarteDiagnosticFavoris';
import ReglageRappel from './ReglageRappel';
import CarteForcesFaiblesses from './CarteForcesFaiblesses';
import CarteBadges from './CarteBadges';
import CarteExamens from './CarteExamens';
import MascotteKunz from './MascotteKunz';
import CarteHorsLigne from './CarteHorsLigne';

interface Props {
  etat: Etat;
  carnet?: FauteCarnet[]; // سجلّ الأخطاء الذرّية (v0.8) — capturé dans les exercices de منهجية
  onEffacerCarnet: () => void;
  onNom: (nom: string) => void;
  onDateBac: (iso: string) => void;
  onSupprimerNote: (id: string) => void;
  onReinitialiser: () => void;
  onRestaurer: (etat: Etat, stats?: StatsReponses) => void; // استيراد نسخة احتياطية كاملة
  onDeconnexion?: () => void;
  onConsentementSync: (ok: boolean) => void;
  onObjectif: (o: Objectif) => void;
  onModeIntensif: (m: 'auto' | 'on' | 'off') => void;
  onTailleTexte: (t: TailleTexte) => void;
  onOuvrirDiagnostic: () => void;
  onOuvrirLecon: (lessonId: string) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onBasculerFavori: (lessonId: string) => void;
  onRappel: (r: { actif: boolean; heure: string }) => void;
  onAllerExercices: () => void;
  onOuvrirConfidentialite: () => void;
}

/** Export JSON unifié : sur Android/iOS le WebView Capacitor n'a AUCUN DownloadListener
 *  (a.download + Blob échoue en silence, vérifié empiriquement) — on écrit donc le fichier
 *  via le plugin Filesystem puis on ouvre la feuille de partage (Share) pour que l'élève
 *  l'enregistre où il veut. Sur web, on garde le Blob + lien local. Retourne le message
 *  de confirmation en arabe (chiffres latins, zéro pourcentage — même ton sans jugement). */
async function exporterJson(paquet: unknown, nomFichier: string, titre: string): Promise<string> {
  const json = JSON.stringify(paquet, null, 2);
  if (Capacitor.isNativePlatform()) {
    const fichier = await Filesystem.writeFile({
      path: nomFichier,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    try {
      await Share.share({ title: titre, url: fichier.uri, dialogTitle: titre });
    } catch {
      // Le cache natif est temporaire : une annulation ne signifie pas que la copie est sauvée.
      return `أُلغي أو تعذّر المشاركة. الملف المؤقّت قد يُحذف؛ أعد التصدير واحفظه في مكان آمن.`;
    }
    return `فُتحت المشاركة للملف « ${nomFichier} ». تأكّد بنفسك من حفظه في مكان آمن؛ نسخة ذاكرة التخزين المؤقّت قد تُحذف.`;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
  return `طُلِب تنزيل « ${nomFichier} » — تأكّد من وجود الملف واحفظه في مكان آمن.`;
}

/** Export du carnet d'erreurs (JSON). Numéros latins, zéro pourcentage — pas de jugement. */
function exporterCarnet(fautes: FauteCarnet[]): Promise<string> {
  return exporterJson(
    {
      application: 'بوصلة العلوم · منهجية',
      exporteLe: new Date().toISOString(),
      total: fautes.length,
      carnet: fautes,
    },
    'carnet-failles.json',
    'سجلّ الأخطاء',
  );
}

/** Sauvegarde complète : TOUT l'état de l'app (progression, SM-2, جسور, كفاءة, carnet, journal,
 *  drills et statistiques, sans compte ni consentement) en un seul JSON local. La progression survit ainsi au changement de
 *  navigateur, d'appareil ou à un effacement du stockage — un fichier = tout le chemin.
 *  Le paquet est construit par paquetExportComplet (P-1.1) : enveloppe versionnée, secrets
 *  exclus — l'import (étatDepuisFichier) accepte ce format ET l'ancien format plat. */
function exporterEtatComplet(etat: Etat): Promise<string> {
  return exporterJson(
    paquetExportComplet(etat),
    'bousala-sauvegarde.json',
    'نسخة احتياطية',
  );
}

export default function Ana({
  etat,
  carnet = [],
  onEffacerCarnet,
  onNom,
  onDateBac,
  onSupprimerNote,
  onReinitialiser,
  onRestaurer,
  onDeconnexion,
  onConsentementSync,
  onObjectif,
  onModeIntensif,
  onTailleTexte,
  onOuvrirDiagnostic,
  onOuvrirLecon,
  onDemarrerRevision,
  onBasculerFavori,
  onRappel,
  onAllerExercices,
  onOuvrirConfidentialite,
}: Props) {
  const [confirme, setConfirme] = useState(false);
  const [confirmeCarnet, setConfirmeCarnet] = useState(false);
  const [erreurImport, setErreurImport] = useState<string | null>(null);
  const [noteExport, setNoteExport] = useState<{ ou: 'carnet' | 'sauvegarde'; texte: string } | null>(null);
  const entreeFichier = useRef<HTMLInputElement>(null);
  const notes = [...etat.notes].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const fautes = [...carnet].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const recentes = fautes.slice(0, 15);
  const faits = itemsFaits(etat);
  const jalons = Object.values(etat.jalons).filter((j) => j.fait).length;
  const xp = xpDe(etat);
  const niveau = niveauDe(xp);
  const jours = joursConsecutifs(etat.journal);
  const wilaya = etat.compte ? WILAYA_PAR_CODE[etat.compte.wilaya] : undefined;

  const h = Math.floor(etat.minutesTotales / 60);
  const m = etat.minutesTotales % 60;
  const tempsAr =
    h === 0
      ? `${nb(m)} دقيقة`
      : m === 0
        ? `${nb(h)} ساعة`
        : `${nb(h)} ساعة و${nb(m)} دقيقة`;

  const derniersJours = [...etat.journal].sort().slice(-12);

  /** Validation et confirmation avant toute restauration. */
  async function importerFichier(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const fichier = e.target.files?.[0];
    e.target.value = ''; // permet de ré-importer le même fichier ensuite
    if (!fichier) return;
    try {
      if (fichier.size > 5 * 1024 * 1024) {
        setErreurImport('الملف أكبر من ٥ ميغابايت.'); return;
      }
      const brut: unknown = JSON.parse(await fichier.text());
      const lu = lireSauvegarde(brut);
      if (!lu) {
        setErreurImport('هذا الملف ليس نسخة احتياطية من التطبيق.');
        return;
      }
      if (!window.confirm('ستُستبدل بيانات تقدّمك الحالية. سيبقى الحساب والموافقة على هذا الجهاز كما هما. النسخ القديمة لا تحتوي على الإحصاءات، فتظلّ الحالية. هل تتابع؟')) return;
      setErreurImport(null);
      onRestaurer(normaliserSauvegarde(lu), lu.stats);
    } catch {
      setErreurImport('لم أستطع قراءة الملف — جرّب ملف JSON صادرًا من هذا التطبيق.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-6">
        <p className="eyebrow">الكرّاسة</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">أنا</h1>
      </header>
      <MascotteKunz
        compact
        tone="paper"
        message="هذه كراستك يا مستكشف. سجّل تقدمك، راجع أخطاءك، وابنِ عادتك العلمية خطوة بعد خطوة."
      />

      {/* الهوية */}
      <section className="card p-5">
        <p className="eyebrow">هويتي</p>
        <label className="mt-3 block text-xs font-bold text-ink-soft" htmlFor="nom">
          اسمي
        </label>
        <input
          id="nom"
          type="text"
          dir="rtl"
          value={etat.nom}
          onChange={(e) => onNom(e.target.value)}
          placeholder="اكتب اسمك..."
          className="field mt-1.5 disabled:opacity-50"
        />
        <label className="mt-4 block text-xs font-bold text-ink-soft" htmlFor="datebac">
          تاريخ امتحاني
        </label>
        <input
          id="datebac"
          type="date"
          value={etat.dateBac ?? ''}
          onChange={(e) => e.target.value && onDateBac(e.target.value)}
          className="field mt-1.5 disabled:opacity-50"
        />
        {etat.dateBac && (
          <p className="mt-2 text-[11px] text-mute">
            متبقّيًا {nb(Math.max(0, differenceJours(aujourdhui(), etat.dateBac)))} يومًا على
            امتحانك — خُطّط بهدوء، يومًا بيوم.
          </p>
        )}
      </section>

      {/* الحساب */}
      {etat.compte && (
        <section className="card mt-5 p-5">
          <p className="eyebrow">حسابي</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest text-lg font-black text-paper">
              {etat.compte.email.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold" dir="ltr">
                {etat.compte.email}
              </p>
              <p className="mt-1 text-xs text-mute">
                {wilaya ? `${wilaya.nom} — ${etat.compte.daira}` : 'ولايتك غير محدّدة'}
              </p>
              <p className="mt-1 text-[11px] text-mute">
                عضو منذ {formatJourAr(etat.compte.creeLe.slice(0, 10))}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip text-[11px] font-bold text-forest-deep">{niveau.nom}</span>
            <span className="chip text-[11px] font-bold text-forest-deep">{xpTexte(xp)}</span>
            <span className="chip text-[11px] font-bold text-forest-deep">
              🔥 {joursNb(jours)}
            </span>
          </div>
          {onDeconnexion && (
            <button onClick={onDeconnexion} className="btn btn-ghost mt-4 w-full text-sm">
              تسجيل الخروج
            </button>
          )}
        </section>
      )}

      {/* الأقوى / الأضعف (P2.4) */}
      <CarteForcesFaiblesses etat={etat} onDemarrerRevision={onDemarrerRevision} onAllerExercices={onAllerExercices} />

      {/* شارات المحتوى (P3.2) */}
      <CarteBadges etat={etat} />

      {/* سجلّ الامتحانات التجريبية (P1.4) */}
      <CarteExamens etat={etat} onAllerExercices={onAllerExercices} />

      {/* التموضع · المفضّلة */}
      <CarteDiagnosticFavoris
        etat={etat}
        onOuvrirDiagnostic={onOuvrirDiagnostic}
        onOuvrirLecon={onOuvrirLecon}
        onDemarrerRevision={onDemarrerRevision}
        onBasculerFavori={onBasculerFavori}
      />

      {/* الهدف · المراجعة المكثّفة · حجم الخط */}
      <ReglagesParcours
        etat={etat}
        onObjectif={onObjectif}
        onModeIntensif={onModeIntensif}
        onTailleTexte={onTailleTexte}
      />

      {/* التذكير اليومي (P2.4) */}
      <ReglageRappel etat={etat} onChanger={onRappel} />

      {/* المزامنة — إعداد دائم */}
      <ReglageSync etat={etat} onChoix={onConsentementSync} />

      {/* الخصوصية · الأسئلة الشائعة · عن التطبيق (P0.8 / P3.4) */}
      <button type="button" onClick={onOuvrirConfidentialite} className="card mt-5 w-full p-5 text-start transition-colors hover:border-forest">
        <p className="eyebrow">الخصوصية · الأسئلة الشائعة · عن التطبيق</p>
        <p className="mt-1 text-sm font-bold">ما يحدث لبياناتك بالضبط، حقوقك، وحذف سجلّك من الخادم ←</p>
      </button>

      {/* الإحصاء بالحروف */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">رحلتي بالأرقام</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-sage bg-sage-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest">{tempsAr}</p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">من التركيز المنظّم</p>
          </div>
          <div className="rounded-2xl border border-sage bg-sage-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest">
              {nbMin(faits)} من {nbMin(CHEMIN.length)}
            </p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">بنية في الطريق</p>
          </div>
          <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest-deep">{nb(etat.revisions)}</p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">جلسات استرجاع</p>
          </div>
          <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest-deep">{nb(jalons)}</p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">جسور مكتوبة</p>
          </div>
          <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5">
            <p className="font-naskh text-lg font-black leading-snug text-forest-deep">
              {xpTexte(xp)}
            </p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">نقاط الخبرة — {niveau.nom}</p>
          </div>
          <div className="rounded-2xl border border-sage bg-sage-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest">🔥 {joursNb(jours)}</p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">من النشاط المتّصل</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-mute">
          لا نسبة مئوية، ولا سلسلة تُعرض لك كخسارة. الأرقام هنا لتحفيذك فقط — والمقارنة الوحيدة
          المسموح بها هي مع نفسك بالأمس.
        </p>
      </section>

      {/* إحصاء المُرشد — تفصيل حسب المصدر */}
      <div className="mt-5">
        <CarteStats complet />
      </div>

      {/* سجلّ النشاط */}
      {derniersJours.length > 0 && (
        <section className="card mt-5 p-5">
          <p className="eyebrow">أيام نشاطي</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {derniersJours.map((j) => (
              <span
                key={j}
                className="chip text-[11px] font-bold text-forest-deep"
                title={formatJourAr(j)}
              >
                {formatCourteAr(j)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* الكرّاسة */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">دوّن</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {notes.length === 0
                ? 'لا ملاحظات بعد'
                : notes.length === 1
                  ? 'ملاحظة واحدة'
                  : notes.length === 2
                    ? 'ملاحظتان'
                    : `${nb(notes.length)} ملاحظات`}
            </p>
          </div>
          <span className="text-2xl">📓</span>
        </div>

        {notes.length === 0 ? (
          <div className="mt-4">
            <Morceau>
              هنا تظهر الملاحظات والأسئلة التي سجّلتها سابقًا. يمكنك حذفها متى شئت — لا جديد
              يُسجَّل الآن، فالتركيز كله على الاختيار الصحيح.
            </Morceau>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {notes.map((n: NoteCarnet) => (
              <li
                key={n.id}
                className="rounded-2xl border border-line bg-cream/50 p-3.5"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      n.kind === 'question'
                        ? 'bg-gold-soft text-forest-deep'
                        : 'bg-sage text-forest-deep'
                    }`}
                  >
                    {n.kind === 'question' ? 'سؤال' : 'فكرة'}
                  </span>
                  <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">{n.texte}</p>
                  <button
                    onClick={() => onSupprimerNote(n.id)}
                    className="shrink-0 text-xs font-bold text-mute transition-colors hover:text-clay"
                    aria-label="حذف"
                  >
                    ✕
                  </button>
                </div>
                {n.ts && (
                  <p className="mt-1.5 text-[10px] text-mute">{formatCourteAr(n.ts.slice(0, 10))}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* سجلّ الأخطاء — v0.8 : capturé automatiquement dans les exercices de منهجية */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">سجلّ الأخطاء</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {fautes.length === 0
                ? 'لا أخطاء مسجّلة بعد'
                : fautes.length === 1
                  ? 'خطأ واحد مسجّل'
                  : fautes.length === 2
                    ? 'خطآن مسجّلان'
                    : `${nb(fautes.length)} أخطاء مسجّلة`}
            </p>
          </div>
          <span className="text-2xl">🔍</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          كل خطأ في تمارين المنهجية (اختيار، محرّر، استقصاء، تشريح) يُسجَّل هنا آليًا مع جوابك
          الخاطئ وتشخيصه. لا يُسجَّل الجواب الصحيح: المفاجآت محفوظة لوقت التمرين، وهذه خريطة ما
          ستعيد مراجعته.
        </p>

        {fautes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setNoteExport(null);
                exporterCarnet(fautes)
                  .then((texte) => setNoteExport({ ou: 'carnet', texte }))
                  .catch(() => setNoteExport({ ou: 'carnet', texte: 'تعذّر التصدير — جرّب من جديد.' }));
              }}
              className="btn btn-primary flex-1 text-sm"
            >
              تصدير السجلّ
            </button>
            {!confirmeCarnet ? (
              <button
                onClick={() => setConfirmeCarnet(true)}
                className="btn btn-ghost flex-1 text-sm text-clay"
              >
                مسح السجلّ
              </button>
            ) : (
              <button
                onClick={() => {
                  setConfirmeCarnet(false);
                  onEffacerCarnet();
                }}
                className="btn flex-1 bg-clay text-paper text-sm"
              >
                نعم، امسح السجلّ
              </button>
            )}
          </div>
        )}

        {noteExport?.ou === 'carnet' && (
          <p
            role="status"
            className="mt-3 rounded-xl border border-forest bg-sage px-3 py-2 text-sm font-bold text-forest-deep"
          >
            {noteExport.texte}
          </p>
        )}

        {fautes.length === 0 ? (
          <div className="mt-4">
            <Morceau>
              لا أخطاء بعد — عندما تخطئ في تمرين، يُسجَّل هنا جوابك وتشخيصه تلقائيًا. هذا ليس
              عقابًا؛ إنها خريطة صغيرة لما ستعيده وتثبّته.
            </Morceau>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {recentes.map((f) => (
              <li key={f.id} className="rounded-2xl border border-line bg-cream/50 p-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-forest-deep">
                    {f.contexte}
                  </span>
                  <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[10px] font-bold text-clay">
                    اخترت: {f.donne}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-mute">{f.enonce}</p>
                <p className="mt-1 text-sm leading-relaxed text-forest-deep">{f.diagnostic}</p>
                <p className="mt-1.5 text-[10px] text-mute">{formatCourteAr(f.ts.slice(0, 10))}</p>
              </li>
            ))}
          </ul>
        )}
        {fautes.length > recentes.length && (
          <p className="mt-3 text-[11px] text-mute">
            تعرض آخر {nb(recentes.length)} أخطاء؛ السجلّ الكامل ({nb(fautes.length)}) جاهز في
            التصدير.
          </p>
        )}
      </section>

      <CarteHorsLigne />

      {/* النسخة الاحتياطية — export/import complet de l'état (v0.9.1) */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">النسخة الاحتياطية</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          صدّر كل مسارك — الدروس، الاسترجاعات، الجسور، بطاقات الكفاءة، سجلّ الأخطاء — في ملف
          واحد، واستعده في أي جهاز. يحتوي الملف ملاحظاتك وتقدّمك بنص واضح؛ احفظه في مكان آمن. لا ينقل حسابك أو رمز المزامنة أو موافقتك.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setNoteExport(null);
              exporterEtatComplet(etat)
                .then((texte) => setNoteExport({ ou: 'sauvegarde', texte }))
                .catch(() => setNoteExport({ ou: 'sauvegarde', texte: 'تعذّر التصدير — جرّب من جديد.' }));
            }}
            className="btn btn-primary flex-1 text-sm"
          >
            تصدير نسختي
          </button>
          <button
            onClick={() => entreeFichier.current?.click()}
            className="btn btn-ghost flex-1 text-sm"
          >
            استيراد نسخة
          </button>
          <input
            ref={entreeFichier}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importerFichier}
          />
        </div>
        {noteExport?.ou === 'sauvegarde' && (
          <p
            role="status"
            className="mt-3 rounded-xl border border-forest bg-sage px-3 py-2 text-sm font-bold text-forest-deep"
          >
            {noteExport.texte}
          </p>
        )}
        {erreurImport && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-clay-soft bg-clay-soft/60 px-3 py-2 text-sm font-bold text-clay"
          >
            {erreurImport}
          </p>
        )}
      </section>

      {/* منطقة الخطر */}
      <section className="card mt-5 border-clay-soft p-5">
        <p className="eyebrow text-clay">إعادة الضبط</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          تحذف كل التقدّم، الملاحظات، الجسور، وجدول التكرار. لا يمكن التراجع.
        </p>
        {!confirme ? (
          <button
            onClick={() => setConfirme(true)}
            className="btn btn-ghost mt-3 w-full text-sm text-clay"
          >
            مسح كل بياناتي
          </button>
        ) : (
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                setConfirme(false);
                onReinitialiser();
              }}
              className="btn flex-1 bg-clay text-paper"
            >
              نعم، امسح كل شيء
            </button>
            <button
              onClick={() => setConfirme(false)}
              className="btn btn-ghost flex-1"
            >
              تراجع
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
