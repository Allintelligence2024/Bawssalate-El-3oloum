// مساري — الطريق الكامل مقفلًا حتى يُنهى ما قبله. لا وصول مباشر للدروس المتقدّمة.
//
// Habillage « maquette » (étape 1) : une carte = une action, jauge au lieu d'un
// pourcentage, badges en `.mention`, et le pont de l'unité en carte pleine largeur.
// La logique (verrouillage, pont, priorités) vient de `moteur.ts` — inchangée.

import {
  CHEMIN,
  DOMAINES,
  UNITE_PAR_ID,
  cleItem,
  idJalon,
  titreItem,
  type ItemChemin,
} from '../data/programme';
import { itemFait, itemVerrouille, leconsUniteFaites } from '../utils/moteur';
import { nb } from '../utils/dates';
import type { Etat } from '../types';
import { ACCENTS } from '../utils/accents';
import { IcoVerifie, IcoVerrou } from './Icones';
import { prioriteLecon } from '../data/priorites';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onVoirUnite: (uniteId: string) => void;
  onOuvrirMindmap: () => void;
  onOuvrirRecherche?: () => void;
}

function itemsUnite(uniteId: string): ItemChemin[] {
  const u = UNITE_PAR_ID[uniteId];
  const items: ItemChemin[] = [
    ...(u.prerequis ?? []).map((id) => ({ type: 'lecon' as const, id })),
    ...u.lessonIds.map((id) => ({ type: 'lecon' as const, id })),
  ];
  return items;
}

export default function Masari({ etat, onOuvrirItem, onVoirUnite, onOuvrirMindmap,
  onOuvrirRecherche }: Props) {
  const faits = CHEMIN.filter((i) => itemFait(etat, i)).length;
  const pourcent = Math.round((faits / Math.max(CHEMIN.length, 1)) * 100);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <header className="mb-4">
        <p className="oeil">الطريق · 3 مجالات</p>
        <h1 className="titre-1 mt-1">مساري</h1>
        <p className="petit doux mt-1">
          11 وحدة، {nb(CHEMIN.length)} بنية. كلّ بند مقفل حتى تنهي اللي قبله — هذه الضمانة
          الوحيدة لعدم تراكم الثغرات.
        </p>
        <div className="rangee rangee--galerie mt-3">
          {onOuvrirRecherche && (
            <button type="button" className="btn-mini" onClick={onOuvrirRecherche}>
              <span aria-hidden="true">🔎</span> بحث
            </button>
          )}
          <button type="button" className="btn-mini" onClick={onOuvrirMindmap}>
            <span aria-hidden="true">🗺️</span> الخريطة الذهنية
          </button>
        </div>
      </header>

      {/* Où j'en suis — une seule ligne, jamais un pourcentage affiché */}
      <section className="carte mb-4">
        <div className="rangee rangee--entre mb-2">
          <span className="oeil">تقدّمي في الطريق</span>
          <span className="mention mention--or tnum">
            {nb(faits)} من {nb(CHEMIN.length)}
          </span>
        </div>
        <div
          className="jauge"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={CHEMIN.length}
          aria-valuenow={faits}
          aria-label="تقدّمي في الطريق"
        >
          <div className="jauge__r" style={{ width: `${pourcent}%` }} />
        </div>
        <p className="petit doux mt-2">بنية واحدة في كلّ حصّة — الباقي يجي وحدو.</p>
      </section>

      <MascotteKunz
        compact
        message="أهلاً أيها المستكشف! افتح الوحدات بالتدريج: كل درس تنهيه يفتح لك جزءًا جديدًا من خريطة بوصلة العلوم."
      />

      <div className="mt-5 flex flex-col gap-6">
        {DOMAINES.map((d) => {
          const accent = ACCENTS[d.accent] ?? ACCENTS.forest;
          return (
            <section key={d.id}>
              <div className={`mb-3 flex items-center gap-2 border-r-4 ${accent.border} pr-3`}>
                <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <h2 className="font-naskh text-lg font-bold leading-snug">{d.titre}</h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {d.unites.map((uniteId) => {
                  const u = UNITE_PAR_ID[uniteId];
                  const items = itemsUnite(uniteId);
                  const premierVerrouille = itemVerrouille(etat, items[0]);
                  const jalonVerrouille = itemVerrouille(etat, { type: 'jalon', uniteId });
                  const faites = leconsUniteFaites(etat, uniteId);
                  const total = u.lessonIds.length;
                  const jalonFait = itemFait(etat, { type: 'jalon', uniteId });
                  const uniteActuelle = !premierVerrouille && faites < total;
                  const pct = Math.round((faites / Math.max(total, 1)) * 100);

                  return (
                    <div
                      key={uniteId}
                      className={`carte ${uniteActuelle ? 'ring-2 ring-primary/25' : ''}`}
                    >
                      {/* رأس الوحدة — نقرة واحدة تفتح جسر الوحدة */}
                      <button
                        type="button"
                        onClick={() => onVoirUnite(uniteId)}
                        className="carte__ligne w-full text-right"
                      >
                        <span
                          className={`grid h-9 w-9 flex-none place-items-center rounded-xl text-sm font-black tnum ${
                            jalonFait
                              ? 'bg-primary text-bg'
                              : uniteActuelle
                                ? 'bg-primary-soft text-primary'
                                : premierVerrouille
                                  ? 'bg-bg text-mute border border-line'
                                  : 'bg-gold-soft text-honey-ink'
                          }`}
                          aria-hidden="true"
                        >
                          {jalonFait ? '✓' : nb(u.numero)}
                        </span>

                        <span className="carte__texte mx-2 flex-1">
                          <span className="carte__titre block">{u.titre}</span>
                          <span className="petit doux block">
                            {nb(faites)} من {nb(total)} دروس · {u.fenetreAr}
                          </span>
                          {!premierVerrouille && (
                            <span className="jauge mt-2 block" aria-hidden="true">
                              <span className="jauge__r block" style={{ width: `${pct}%` }} />
                            </span>
                          )}
                        </span>

                        <span className="flex flex-none items-center gap-1.5">
                          <span
                            className="mention mention--or"
                            title="ثقل الوحدة في البكالوريا (1-5)"
                          >
                            {u.poidsBac}/5
                          </span>
                          {premierVerrouille ? (
                            <span className="block h-4 w-4 text-mute" aria-label="مقفلة">
                              <IcoVerrou />
                            </span>
                          ) : jalonFait ? (
                            <span className="block h-4 w-4 text-primary" aria-label="منجزة">
                              <IcoVerifie />
                            </span>
                          ) : (
                            <span className="block h-4 w-4 text-mute" aria-hidden="true">
                              <IcoVerrou />
                            </span>
                          )}
                        </span>
                      </button>

                      {/* قائمة الدروس — تظهر إن فُتحت الوحدة */}
                      {!premierVerrouille && (
                        <div className="mt-2 border-t border-line pt-1">
                          <ul className="flex flex-col">
                            {items.map((item) => {
                              const fait = itemFait(etat, item);
                              const enCours =
                                item.type === 'lecon' &&
                                etat.progression[item.id]?.statut === 'en_cours';
                              const verrouille = itemVerrouille(etat, item);
                              return (
                                <li key={cleItem(item)}>
                                  <button
                                    type="button"
                                    onClick={() => !verrouille && onOuvrirItem(item)}
                                    disabled={verrouille}
                                    className="rangee w-full py-2 text-right transition-colors hover:bg-sage-soft/60 disabled:opacity-60"
                                  >
                                    <span className="grid h-5 w-5 flex-none place-items-center">
                                      {fait ? (
                                        <span className="block h-4 w-4 text-primary">
                                          <IcoVerifie />
                                        </span>
                                      ) : enCours ? (
                                        <span className="block h-2.5 w-2.5 rounded-full bg-gold" />
                                      ) : verrouille ? (
                                        <span className="block h-3.5 w-3.5 text-mute">
                                          <IcoVerrou />
                                        </span>
                                      ) : (
                                        <span className="block h-3 w-3 rounded-full border-2 border-line" />
                                      )}
                                    </span>
                                    <span
                                      className={`flex-1 text-sm ${
                                        fait
                                          ? 'font-semibold text-mute'
                                          : enCours
                                            ? 'font-bold text-primary'
                                            : 'font-medium text-ink-soft'
                                      }`}
                                    >
                                      {titreItem(item)}
                                    </span>
                                    {enCours && <span className="mention mention--or">متابعة</span>}
                                    {item.type === 'lecon' && prioriteLecon(item.id) === 1 && !fait && !verrouille && (
                                      <span
                                        className="mention"
                                        title="ظهر هذا الموضوع في معظم مواضيع البكالوريا السابقة"
                                      >
                                        يتكرّر
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>

                          {/* جسر الوحدة — carte pleine largeur, une seule action */}
                          <button
                            type="button"
                            onClick={() => !jalonVerrouille && onVoirUnite(uniteId)}
                            disabled={jalonVerrouille}
                            className={`carte__ligne mt-2 w-full rounded-xl border p-2.5 text-right transition-colors disabled:opacity-60 ${
                              jalonFait
                                ? 'border-primary/30 bg-primary-soft'
                                : jalonVerrouille
                                  ? 'border-line bg-bg'
                                  : 'border-honey-line bg-honey-soft hover:bg-honey-soft/70'
                            }`}
                          >
                            <span className="text-base" aria-hidden="true">🌉</span>
                            <span className="carte__texte mx-2 flex-1">
                              <span className="block text-sm font-bold">
                                جسر الوحدة {nb(u.numero)}
                              </span>
                              <span className="petit doux block">
                                {jalonFait
                                  ? 'أَجَبْتَ عن سؤال الوحدة كتابةً من ذاكرتك.'
                                  : jalonVerrouille
                                    ? 'يُفتح بعد إنهاء كل دروس الوحدة.'
                                    : 'سؤال واحد، إجابة مكتوبة من الذاكرة — هذا هو الجسر.'}
                              </span>
                            </span>
                            {jalonFait && (
                              <span className="block h-5 w-5 flex-none text-primary">
                                <IcoVerifie />
                              </span>
                            )}
                          </button>
                        </div>
                      )}

                      {premierVerrouille && (
                        <p className="petit doux mt-2 border-t border-line pt-2">
                          {u.numero === 1
                            ? 'يُفتح هذا القسم مع بداية الطريق.'
                            : `يُفتح هذا القسم بعد إنهاء جسر الوحدة ${nb(u.numero - 1)}.`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="petit doux mt-8 text-center">
        الطريق وحده يصل بك. {nb(CHEMIN.length)} بنية، واحدة في كلّ حصّة.
      </p>
    </div>
  );
}
