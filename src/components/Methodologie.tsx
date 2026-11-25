// Ateliers de méthodologie. Le laboratoire Boussole est l’entrée ; les exercices gardent leur propre état.
import { useState, useRef } from 'react';
import Boussole, { AideBoussole } from './Boussole';
import { IcoRetour } from './Icones';
import { sonFaux, sonJuste } from '../utils/son';
import { nb } from '../utils/dates';
import MascotteKunz from './MascotteKunz';
import type { Qualite } from '../utils/srs';
import type { BoussoleAttemptEvent } from '../types/boussoleBridge';

interface Props {
  onFermer: () => void;
  /** Écran d'ouverture : laboratoire (onglet البوصلة) ou niveaux (3e porte تمارين dans تدريبات). */
  modeInitial?: 'boussole' | 'niveaux';
  /** المرشد الموسّع (P3.5) */
  onOuvrirMourchid?: () => void;
  /** Bataille de كفاءة : enregistre la réussite d'un exercice dans la file SM-2 (audit). */
  onResultatKafaa?: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string }
  ) => void;
  /** سجلّ الأخطاء الذرّية (v0.8) : chaque erreur d'exercice est capturée (contexte, jeton
   *  fautif, diagnostic typé) — jamais la bonne réponse. Persisté + exportable dans l'onglet « أنا ». */
  onCarnetFaute?: (f: { contexte: string; enonce: string; donne: string; diagnostic: string }) => void;
  /** خيار فتح السَّمْيَة الْحُرَّة pour les exercices de type synthese (P1.3). */
  onOuvrirSynthese?: (exo: {
    uniteId: string;
    sujet: string;
    question: string;
    modele: string[];
    pieges: string[];
    diagnostic: { id: string; ar: string };
  }) => void;
  /** أحداث جسر البوصلة (Lot 5A) — مُتحقَّق منها بالأصل والمصدر والمخطّط قبل الوصول. */
  onBoussoleEvent?: (evt: BoussoleAttemptEvent) => void;
}

type Ecran = 'boussole' | 'accueil' | 'operations' | 'verbes' | 'diagnostic' | 'methode' | 'niveaux' | 'unite1' | 'exercice' | 'redaction' | 'enquete' | 'autopsie' | 'resultat' | 'diagrammes';

import {
  operations,
  verbes,
  methodes,
  methodesExercices,
  ETAPES_ENQUETE,
  TUILES_BAREME,
  GRILLE_BAREME,
  LIBELLE_FAUTE,
  COPIE_AUTOPSIE,
  exercicesEnquete,
  niveaux,
  diagnostic,
  contrastesVerbes,
  REFAIRE,
  exercicesUnite1,
  DIAGRAMMES,
  optionsExercice,
  lettreZone,
  optionsMethode,
  optionsEnquete,
  segmentsReponse,
  tuilesEmplacement,
  tuilesEmplacementEnquete,
  tuilesClozeEmplacement,
  barreauxAide,
  type ExerciceUnite1,
} from '../data/methodologie';
import { gabaritCloze, SchemaUnite1 } from './methodologie/SchemaUnite1';


export default function Methodologie({
  onFermer,
  modeInitial = 'boussole',
  onOuvrirMourchid,
  onResultatKafaa,
  onCarnetFaute,
  onOuvrirSynthese,
  onBoussoleEvent,
}: Props) {
  const [ecran, setEcran] = useState<Ecran>(modeInitial);
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [dernierFaux, setDernierFaux] = useState<number | null>(null);
  const [erreur, setErreur] = useState(false);
  // Message de диагностика typée : texte du distracteur choisi (افعل/faux) — jamais la bonne.
  const [diagMsg, setDiagMsg] = useState('');
  const [rate, setRate] = useState(false); // échec au 1er essai sur la question en cours (persiste pendant les réessais)
  const [operation, setOperation] = useState(0);
  const [methode, setMethode] = useState(0);
  const [reponse, setReponse] = useState<number | null>(null);
  // وثيقة تفاعلية : la zone du schéma choisie comme preuve (port fa88370 — null = pas encore choisie).
  const [zoneActive, setZoneActive] = useState<number | null>(null);
  const [dernierFauxExo, setDernierFauxExo] = useState<number | null>(null);
  const [justeExo, setJusteExo] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTon, setFeedbackTon] = useState<'juste' | 'refaire'>('juste');
  // Origine du tamrin affiché : unité 1 (0-9) ou méthode classique (0-5) — les index se
  // chevauchent, d'où un état dédié (correction du bug de collision du commit arena).
  const [sourceExo, setSourceExo] = useState<'unite1' | 'chemin'>('chemin');
  // محرّر الجواب (audit) : assemblage des tuiles de la réponse modèle, sans clavier.
  const [slotRedaction, setSlotRedaction] = useState(0);
  const [tuilesChoisies, setTuilesChoisies] = useState<string[]>([]);
  const [tuileFausse, setTuileFausse] = useState<number | null>(null);
  const [redactionFin, setRedactionFin] = useState(false);
  // محرّر 5 tuiles (audit, +1,1) : source, erreurs (→ J+1), remélange après erreur, diagnostic typé.
  const [redactionSource, setRedactionSource] = useState<'unite1' | 'enquete'>('unite1');
  const [fauxRedaction, setFauxRedaction] = useState(0);
  const [varianteRedaction, setVarianteRedaction] = useState(0);
  const [diagnoRedaction, setDiagnoRedaction] = useState('');
  /** Blank courant dans le slot actif du محرّر — mode « canevas à blancs » (cloze). */
  const [blancRedaction, setBlancRedaction] = useState(0);
  // سلّم المساعدة (audit) : barreaux ouverts (0-3), erreurs validées sur l'exo courant,
  // laboratoire en surimpression sans perte de l'état de l'exercice.
  const [barreaux, setBarreaux] = useState(0);
  const [fauxExo, setFauxExo] = useState(0);
  const ouvrirAide = useRef<HTMLButtonElement>(null);
  const [aideBoussole, setAideBoussole] = useState(false);
  // استقصاء · وثيقتان (exos 2-3 du Bac) : enquête en 4 خطوات, une par exercice.
  const [enqueteId, setEnqueteId] = useState(0);
  const [etapeEnq, setEtapeEnq] = useState(0);
  const [enqueteFin, setEnqueteFin] = useState(false);
  const [fauxTotalEnquete, setFauxTotalEnquete] = useState(0);
  const [aideEnquete, setAideEnquete] = useState(false);

  // ───────────── تشريح نسخة · عين المصحّح (audit7, mesure n°2) ─────────────
  const [autopsieTiques, setAutopsieTiques] = useState<string[]>([]);
  const [autopsieFaux, setAutopsieFaux] = useState(0);
  const [autopsieRevele, setAutopsieRevele] = useState<string | null>(null);
  const [autopsieFin, setAutopsieFin] = useState(false);
  const [autopsieKafaa, setAutopsieKafaa] = useState(false);

  function startDiagnostic(): void {
    setQ(0);
    setScore(0);
    setErreur(false);
    setRate(false);
    setDernierFaux(null);
    setSelected(null);
    setDiagMsg('');
    setEcran('diagnostic');
  }

  // تشخيص: خطأ = أحمر + نغمة هادئة + رسالة مُصنّفة حسب الفعل المختار (بلا كشف الجواب)؛
  // صواب = أخضر + نغمة صاعدة. Rotation déterministe : la bonne réponse n'est jamais à la
  // même position d'un item à l'autre (jamais de « position 0 » systématique).
  const rotationDiagnostic = (i: number): number => (i + 1) % 3;

  function validerDiagnostic(): void {
    if (selected === null) return;
    const decal = rotationDiagnostic(q);
    const sourceBonne = diagnostic[q][2];
    // index affiché de la bonne réponse : source décalée de `decal`.
    const afficheBon = (sourceBonne + decal) % 3;
    if (selected === afficheBon) {
      sonJuste();
      if (!rate) setScore((s) => s + 1);
      setErreur(false);
      setRate(false);
      setDernierFaux(null);
      setSelected(null);
      setDiagMsg('');
      if (q === diagnostic.length - 1) setEcran('resultat');
      else {
        setQ(q + 1);
      }
    } else {
      sonFaux();
      // index d'origine (dans le tableau source) de l'option affichée « selected ».
      const sourceFaux = (selected - decal + 3) % 3;
      const msg = diagnostic[q][3][diagnostic[q][1][sourceFaux]];
      setDiagMsg(msg ?? REFAIRE);
      setErreur(true);
      setRate(true);
      setDernierFaux(selected);
      setSelected(null);
      // سجلّ الأخطاء الذرّية (v0.8) : le choix fautif + son message typé (jamais la bonne).
      loguerFaute(
        'تشخيص المنهجية',
        diagnostic[q][0],
        diagnostic[q][1][sourceFaux],
        msg ?? REFAIRE,
      );
    }
  }

  function choisirMethode(i: number): void {
    setMethode(i);
    setSourceExo('chemin');
    setEcran('exercice');
    setReponse(null);
    setFeedback('');
    setDernierFauxExo(null);
    setJusteExo(false);
    setBarreaux(0);
    setFauxExo(0);
    setAideBoussole(false);
  }

  function choisirExerciceUnite1(i: number): void {
    const exo = exercicesUnite1[i];
    // Si c'est un exercice de type synthese, on ouvre SyntheseLibre (P1.3)
    if (exo.diagramme === 'synthese' && onOuvrirSynthese) {
      onOuvrirSynthese({
        uniteId: 'U1',
        sujet: exo.document,
        question: exo.consigne,
        // Le modèle est découpé en segments (tuiles) pour l'auto-évaluation
        modele: exo.reponse.split(/[.،؛:]\s*/).filter(Boolean),
        // Les pièges sont les erreurs ciblées
        pieges: Object.values(exo.erreurCible ?? {}),
        // Diagnostic de la brouille (T1-T4)
        diagnostic: { id: 'T1', ar: exo.erreur },
      });
      return;
    }
    setMethode(i);
    setSourceExo('unite1');
    setEcran('exercice');
    reinitialiserExercice();
  }

  /** Retour à zéro complet de l'exercice courant (réponses, zones, échelle d'aide). */
  function reinitialiserExercice(): void {
    setReponse(null);
    setZoneActive(null);
    setFeedback('');
    setDernierFauxExo(null);
    setJusteExo(false);
    setBarreaux(0);
    setFauxExo(0);
    setAideBoussole(false);
  }

  /** سجلّ الأخطاء الذرّية (v0.8) : chaque erreur d'exercice de منهجية est enregistrée avec son
   *  contexte, le choix fautif de l'élève et le diagnostic typé déjà affiché — sans jamais
   *  révéler la bonne réponse (anti-stress). Capturé aux 8 points `sonFaux` ci-dessous. */
  function loguerFaute(contexte: string, enonce: string, donne: string, diagnostic: string): void {
    onCarnetFaute?.({ contexte, enonce, donne, diagnostic });
  }

  // ───────────── استقصاء · وثيقتان — démarche guidée (exos 2 et 3 du Bac) ─────────────

  function demarrerEnquete(): void {
    setEcran('enquete');
    reinitialiserEnquete();
  }

  function choisirEnquete(i: number): void {
    const n = exercicesEnquete.length;
    setEnqueteId(((i % n) + n) % n);
    reinitialiserEnquete();
  }

  function reinitialiserEnquete(): void {
    setEtapeEnq(0);
    setEnqueteFin(false);
    setFauxTotalEnquete(0);
    setAideEnquete(false);
    setReponse(null);
    setDernierFauxExo(null);
    setJusteExo(false);
    setFeedback('');
    setBarreaux(0);
    setFauxExo(0);
  }

  /** Ouverture de l'autopsie : l'élève joue le correcteur d'une copie fictive (mesure n°2). */
  function demarrerAutopsie(): void {
    setAutopsieTiques([]);
    setAutopsieFaux(0);
    setAutopsieRevele(null);
    setAutopsieFin(false);
    setAutopsieKafaa(false);
    setEcran('autopsie');
  }

  /** Tic sur une clause : faute réelle → marquée + critère violé révélé ; clause saine → faux
   *  positif (compté, expliqué, jamais le modèle) ; découvre tout → modèle + carte كفاءة
   *  (J+3 sans faux positif, J+1 dès qu'il y en a — même convention que les autres flows). */
  function tiquerClause(id: string): void {
    if (autopsieFin) return;
    const clause = COPIE_AUTOPSIE.clauses.find((c) => c.id === id);
    if (!clause) return;
    if (autopsieTiques.includes(id)) {
      setAutopsieRevele(id);
      return;
    }
    if (!clause.fautive) {
      sonFaux();
      setAutopsieFaux((n) => n + 1);
      setAutopsieRevele(id);
      // سجلّ الأخطاء الذرّية (v0.8) : faux positif — l'œil du correcteur s'entraîne.
      loguerFaute(
        'تشريح نسخة · عين المصحّح',
        clause.texte,
        'وسم خاطئ: عبارة سليمة اعتُبرت خطأ',
        clause.raisonSaine ?? 'عبارة سليمة — لا خطأ هنا.',
      );
      return;
    }
    sonJuste();
    const suit = [...autopsieTiques, id];
    setAutopsieTiques(suit);
    setAutopsieRevele(id);
    const nbFautes = COPIE_AUTOPSIE.clauses.filter((c) => c.fautive).length;
    if (suit.length === nbFautes) {
      setAutopsieFin(true);
      if (!autopsieKafaa) {
        setAutopsieKafaa(true);
        onResultatKafaa?.('autopsie0', autopsieFaux > 0 ? 3 : 5, {
          verbe: 'صحّح ثم دلّل',
          exercice: 'تشريح نسخة · رفض الطعم',
          erreur: COPIE_AUTOPSIE.erreur,
        });
      }
    }
  }

  /** Validation de l'étape courante : bonne réponse → succès + étape suivante ; erreur → diagnostic typé. */
  function validerEnquete(): void {
    if (reponse === null || enqueteFin) return;
    const exo = exercicesEnquete[enqueteId] ?? exercicesEnquete[0];
    const etapeAct = exo.etapes[etapeEnq];
    const { options, bonne } = optionsEnquete(enqueteId, etapeEnq);
    if (reponse === bonne) {
      sonJuste();
      setJusteExo(true);
      setFeedbackTon('juste');
      setFeedback(etapeAct.succes);
      if (etapeEnq >= exo.etapes.length - 1) {
        setEnqueteFin(true);
        // Carte كفاءة (audit) : réussite directe → J+3، erreurs ou aide → J+1، sur l'ensemble du parcours.
        onResultatKafaa?.(`enquete${enqueteId}`, fauxTotalEnquete > 0 || aideEnquete ? 3 : 5, {
          verbe: 'قارن ثم استنتج',
          exercice: exo.titre,
          erreur: exo.erreur,
        });
      }
    } else {
      sonFaux();
      setDernierFauxExo(reponse);
      setFauxExo((n) => n + 1);
      setFauxTotalEnquete((n) => n + 1);
      setReponse(null);
      setFeedbackTon('refaire');
      const reprocheEnquete = etapeAct.cible[options[reponse]] ?? REFAIRE;
      setFeedback(reprocheEnquete);
      // سجلّ الأخطاء الذرّية (v0.8).
      loguerFaute(
        `استقصاء · وثيقتان · ${ETAPES_ENQUETE[etapeEnq]}`,
        etapeAct.question,
        options[reponse],
        reprocheEnquete,
      );
    }
  }

  function passerEtapeEnquete(): void {
    setEtapeEnq((e) => e + 1);
    setReponse(null);
    setJusteExo(false);
    setFeedback('');
    setDernierFauxExo(null);
    setFauxExo(0);
    setBarreaux(0);
  }

  /** Réessai de l'étape en cours : on garde les barreaux déjà ouverts (même étape, même loyauté). */
  function retryEtapeEnquete(): void {
    setReponse(null);
    setDernierFauxExo(null);
    setFeedback('');
  }

  // ───────────── محرّر الجواب — assemblage de tuiles ─────────────

  function ouvrirRedaction(): void {
    setRedactionSource('unite1');
    setSlotRedaction(0);
    setTuilesChoisies([]);
    setTuileFausse(null);
    setRedactionFin(false);
    setFauxRedaction(0);
    setVarianteRedaction(0);
    setDiagnoRedaction('');
    setEcran('redaction');
  }

  /** Ouverture du محرّر 5 tuiles avec l'enquête courante (exercice 2/3 du Bac). */
  function ouvrirRedactionEnquete(): void {
    setRedactionSource('enquete');
    setSlotRedaction(0);
    setTuilesChoisies([]);
    setTuileFausse(null);
    setRedactionFin(false);
    setFauxRedaction(0);
    setVarianteRedaction(0);
    setDiagnoRedaction('');
    setBlancRedaction(0);
    setEcran('redaction');
  }

  function choisirTuile(idx: number): void {
    if (redactionSource === 'enquete') {
      const m = exercicesEnquete[enqueteId]?.modele ?? exercicesEnquete[0].modele;
      // ── Mode « canevas à blancs » (cloze) : l'élève produit une lexie par blank au lieu de
      //    reconnaître un paragraphe tout fait (audit7, mesure n°1 — briser le plafond clic-only).
      const slotCloze = m.cloze?.[slotRedaction];
      if (slotCloze) {
        const blanc = slotCloze.blancs[blancRedaction];
        if (!blanc) return;
        const { options } = tuilesClozeEmplacement(enqueteId, slotRedaction, blancRedaction, varianteRedaction);
        if (options[idx] === blanc.correct) {
          // Bonne lexie : incrustée dans le gabarit, puis blank suivant / slot suivant.
          sonJuste();
          setTuileFausse(null);
          setDiagnoRedaction('');
          if (blancRedaction + 1 >= slotCloze.blancs.length) {
            // Slot complété : on pose la tuile modèle reconstruite (porte dure interne).
            const attendu = m.tuiles[slotRedaction];
            setTuilesChoisies([...tuilesChoisies, attendu]);
            setBlancRedaction(0);
            if (slotRedaction + 1 >= m.tuiles.length) {
              setRedactionFin(true);
              // La production entre dans la boucle mémoire (audit, vérif. 11) :
              // réussite directe → J+3، erreurs → J+1.
              onResultatKafaa?.(`redactionEnquete${enqueteId}`, fauxRedaction > 0 ? 3 : 5, {
                verbe: 'قارن ثم استنتج',
                exercice: exoEnquete.titre,
                erreur: exercicesEnquete[enqueteId]?.erreur ?? '',
              });
            } else {
              setSlotRedaction(slotRedaction + 1);
            }
          } else {
            setBlancRedaction(blancRedaction + 1);
          }
        } else {
          // Mauvaise lexie : rouge + son doux + diagnostic typé + rotation, sans révélation.
          sonFaux();
          setTuileFausse(idx);
          setFauxRedaction((n) => n + 1);
          const k = options[idx] === blanc.options[1] ? 0 : 1;
          const diagnoCloze = blanc.diagno[k];
          setDiagnoRedaction(diagnoCloze);
          setVarianteRedaction((v) => v + 1);
          // سجلّ الأخطاء الذرّية (v0.8) : la lexie fautive + son diagnostic (jamais la bonne).
          loguerFaute(
            `محرّر · فراغات · ${TUILES_BAREME[slotRedaction].label}`,
            `فراغ ${blancRedaction + 1} من ${slotCloze.blancs.length}`,
            options[idx],
            diagnoCloze,
          );
        }
        return;
      }
      const attendu = m.tuiles[slotRedaction];
      if (attendu === undefined) return;
      const { options } = tuilesEmplacementEnquete(enqueteId, slotRedaction, varianteRedaction);
      if (options[idx] === attendu) {
        // Bonne tuile : verte + son montant, emplacement suivant (porte dure interne).
        sonJuste();
        setTuilesChoisies([...tuilesChoisies, attendu]);
        setTuileFausse(null);
        setDiagnoRedaction('');
        if (slotRedaction + 1 >= m.tuiles.length) {
          setRedactionFin(true);
          // La production entre enfin dans la boucle mémoire (audit, vérif. 11) :
          // réussite directe → J+3، erreurs → J+1.
          onResultatKafaa?.(`redactionEnquete${enqueteId}`, fauxRedaction > 0 ? 3 : 5, {
            verbe: 'قارن ثم استنتج',
            exercice: exoEnquete.titre,
            erreur: exercicesEnquete[enqueteId]?.erreur ?? '',
          });
        } else {
          setSlotRedaction(slotRedaction + 1);
        }
      } else {
        // Mauvaise tuile : rouge + son doux + diagnostic typé + remélange, sans révélation.
        sonFaux();
        setTuileFausse(idx);
        setFauxRedaction((n) => n + 1);
        const k = options[idx] === m.leurres[slotRedaction][0] ? 0 : 1;
        const diagnoTuile = m.diagno[slotRedaction][k];
        setDiagnoRedaction(diagnoTuile);
        setVarianteRedaction((v) => v + 1);
        // سجلّ الأخطاء الذرّية (v0.8) : la tuile fautive + son diagnostic (jamais la bonne).
        loguerFaute(
          `محرّر · بطاقات · ${TUILES_BAREME[slotRedaction].label}`,
          exoEnquete.titre,
          options[idx],
          diagnoTuile,
        );
      }
      return;
    }
    const segments = segmentsReponse(exoU1.reponse);
    const attendu = segments[slotRedaction];
    if (attendu === undefined) return;
    const { options } = tuilesEmplacement(methode, slotRedaction);
    if (options[idx] === attendu) {
      // Bonne tuile : verte + son montant, puis emplacement suivant (sf si dernier).
      sonJuste();
      setTuilesChoisies([...tuilesChoisies, attendu]);
      setTuileFausse(null);
      if (slotRedaction + 1 >= segments.length) {
        setRedactionFin(true);
        // La production entre dans la boucle mémoire (audit, vérif. 11) : J+3 directe, J+1 sinon.
        onResultatKafaa?.(`redaction${methode}`, fauxRedaction > 0 ? 3 : 5, {
          verbe: exoU1.verbe,
          exercice: exoU1.titre,
          erreur: exoU1.erreur,
        });
      } else {
        setSlotRedaction(slotRedaction + 1);
      }
    } else {
      // Mauvaise tuile : rouge + son doux, sans révéler la bonne (retry).
      sonFaux();
      setTuileFausse(idx);
      setFauxRedaction((n) => n + 1);
      // سجلّ الأخطاء الذرّية (v0.8) : tuile déplacée hors de son emplacement.
      loguerFaute(
        `محرّر · ${exoU1.titre}`,
        `الموضع ${slotRedaction + 1} من ${segments.length}`,
        options[idx],
        'ترتيب خاطئ: كل موضع له دوره (مقدمة ← سند ← علاقة ← خلاصة). أعد المحاولة.',
      );
    }
  }

  function validerExercice(): void {
    if (reponse === null) return;
    if (sourceExo === 'unite1') {
      if (reponse === idxJusteU1) {
        // صواب: أخضر + نغمة صاعدة، ثم نكشف «خطأ شائع» (الاشطاح) بعد الجواب الصحيح فقط.
        sonJuste();
        setJusteExo(true);
        setFeedbackTon('juste');
        // Trace non-jugeante du سلّم المساعدة (fait, pas note). Aucun pourcentage.
        const kit =
          ['', ' نجحت بدرجة واحدة من المساعدة — أعده لاحقًا بلا تلميح لتثبيتها.', ' نجحت بدرجتين من المساعدة — أعده لاحقًا بلا تلميح لتثبيتها.', ' نجحت بثلاث درجات من المساعدة — أعده لاحقًا بلا تلميح لتثبيتها.'][barreaux];
        setFeedback(
          `إجابة سليمة. الدليل يطابق الفعل «${exoU1.verbe}»: ${exoU1.preuve}.` +
            kit +
            ` الآن افحص: هل ذكرت المعطى والعلاقة والخلاصة؟`,
        );
        // بطاقة الكفاءة (audit) : réussite directe → J+3، réussite avec erreurs ou aide → J+1 (même SM-2).
        onResultatKafaa?.(`methodo${methode}`, rate || barreaux > 0 ? 3 : 5, {
          verbe: exoU1.verbe,
          exercice: exoU1.titre,
          erreur: exoU1.erreur,
        });
      } else {
        // خطأ: أحمر + نغمة هادئة + إعادة المحاولة بلا كشف الجواب، مع تشخيص Typé du distracteur choisi.
        sonFaux();
        setDernierFauxExo(reponse);
        setFauxExo((n) => n + 1);
        const reproche = exoU1.erreurCible?.[optionsU1[reponse]] ?? REFAIRE;
        setReponse(null);
        setFeedbackTon('refaire');
        setFeedback(reproche);
        // سجلّ الأخطاء الذرّية (v0.8) : le choix fautif + son diagnostic typé.
        loguerFaute(`تمرين الوحدة 1 · ${exoU1.titre}`, exoU1.question, optionsU1[reponse], reproche);
      }
      return;
    }
    // Chemin المنهجية : LE QCM unique a été remplacé par un exercice réel par مسار (audit).
    const { options: optsChemin, bonne: bonneChemin } = optionsMethode(methode);
    if (reponse === bonneChemin) {
      sonJuste();
      setJusteExo(true);
      setFeedbackTon('juste');
      setFeedback(
        `صحيح. طبّقت «${methodes[methode][0]}» بالترتيب الصحيح: ${methodes[methode][1]}.`,
      );
    } else {
      sonFaux();
      setDernierFauxExo(reponse);
      setFauxExo((n) => n + 1);
      const item = methodesExercices[methode] ?? methodesExercices[0];
      const reproche = item.cible[optsChemin[reponse]] ?? REFAIRE;
      setReponse(null);
      setFeedbackTon('refaire');
      setFeedback(reproche);
      // سجلّ الأخطاء الذرّية (v0.8) : le choix fautif + son diagnostic typé.
      loguerFaute(`مسار المنهجية · ${methodes[methode][0]}`, item.question, optsChemin[reponse], reproche);
    }
  }

  // Données de l'exercice unité 1 (précalculées pour l'affichage).
  const exoU1 = exercicesUnite1[methode] ?? exercicesUnite1[0];
  const { options: optionsU1, bonne: idxJusteU1 } = optionsExercice(methode);
  const segmentsU1 = segmentsReponse(exoU1.reponse);
  const aide = barreauxAide(exoU1);
  // Parcours المنهجية : l'exercice réel de la méthode sélectionnée (audit).
  const exoMethode = methodesExercices[methode] ?? methodesExercices[0];
  const { options: optionsChemin, bonne: idxJusteChemin } = optionsMethode(methode);
  // استقصاء · وثيقتان : exercice, étape courante et propositions (rotées).
  const exoEnquete = exercicesEnquete[enqueteId] ?? exercicesEnquete[0];
  const etapeActuelle = exoEnquete.etapes[etapeEnq];
  const { options: optionsEnq, bonne: idxJusteEnq } = optionsEnquete(enqueteId, etapeEnq);
  // محرّر d'enquête : modèle 5 tuiles + mode « canevas à blancs » (cloze) éventuel du slot actif.
  const modeleEnquete = exercicesEnquete[enqueteId]?.modele ?? exercicesEnquete[0].modele;
  const slotClozeActif = modeleEnquete.cloze?.[slotRedaction];
  // تشريح نسخة : clause révélée au verdict + nombre de fautes du jury.
  const clauseAutopsieRevelee = COPIE_AUTOPSIE.clauses.find((c) => c.id === autopsieRevele);
  const nbFautesAutopsie = COPIE_AUTOPSIE.clauses.filter((c) => c.fautive).length;

  if (ecran === 'boussole') {
    return (
      <Boussole
        onAteliers={() => {
          setEcran('accueil');
          window.scrollTo(0, 0);
        }}
        onBoussoleEvent={onBoussoleEvent}
      />
    );
  }

  return (
    <div className={`min-h-dvh bg-cream px-4 pt-5 ${modeInitial === 'boussole' ? 'pb-28' : 'pb-10'}`} dir="rtl">
      <header className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          onClick={modeInitial === 'boussole' ? () => setEcran('boussole') : onFermer}
          aria-label="رجوع"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-mute"
        >
          <span className="block h-5 w-5">
            <IcoRetour />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">تدريب البكالوريا</p>
          <h1 className="font-naskh truncate text-xl font-bold">منهجية حل التمرين</h1>
        </div>
        <span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">
          تدريب
        </span>
      </header>

      <main className="mx-auto mt-5 max-w-3xl">
        {ecran === 'accueil' && (
          <section className="space-y-4">
            <div className="card p-5">
              <p className="eyebrow">تمارين إضافية</p>
              <h2 className="font-naskh mt-1 text-xl font-bold">أيّ مهارة أريد أن أتدرّب عليها؟</h2>
              <button onClick={startDiagnostic} className="btn btn-ghost mt-4 w-full">أجرّب التشخيص</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setEcran('operations')}
                className="card p-4 text-right hover:border-forest"
              >
                <p className="text-sm font-bold text-forest">أصف · أفسّر · أحكم</p>
                <p className="mt-1 text-xs text-mute">العمليات التي تبني جوابًا علميًا.</p>
              </button>
              <button
                onClick={() => setEcran('verbes')}
                className="card p-4 text-right hover:border-forest"
              >
                <p className="text-sm font-bold text-forest">أفعال التعليمة</p>
                <p className="mt-1 text-xs text-mute">افهم المطلوب قبل أن تبدأ.</p>
              </button>
            </div>

            <button
              onClick={demarrerEnquete}
              className="card flex w-full items-center justify-between p-4 text-right hover:border-forest"
            >
              <span>
                <b className="text-sm text-forest">استقصاء · وثيقتان</b>
                <span className="mt-1 block text-xs text-mute">
                  تمرينا البكالوريا 2 و 3: قارن وثيقتين، اربط بينهما، ثم استنتج بلا تعميم.
                </span>
              </span>
              <span className="text-mute">←</span>
            </button>

            <button
              onClick={demarrerAutopsie}
              className="card flex w-full items-center justify-between p-4 text-right hover:border-forest"
            >
              <span>
                <b className="text-sm text-forest">تشريح نسخة · عين المصحّح</b>
                <span className="mt-1 block text-xs text-mute">
                  اكشف الأخطاء الأربعة في نسخة تلميذ: حشو بلا معطى، درس منقوص، لغة عاطفية، خلاصة
                  خارجة.
                </span>
              </span>
              <span className="text-mute">←</span>
            </button>

            <button
              onClick={() => setEcran('diagrammes')}
              className="card flex w-full items-center justify-between p-4 text-right hover:border-forest"
            >
              <span>
                <b className="text-sm text-forest">معرض مخططات المجال الأول</b>
                <span className="mt-1 block text-xs text-mute">
                  {nb(DIAGRAMMES.length)} مخططات للمراجعة البصرية: تدفق المعلومة، الخلايا، الريبوزوم، الطفرات، التعبير… (عرض فقط، بلا تمرين)
                </span>
              </span>
              <span className="text-mute">←</span>
            </button>

            {onOuvrirMourchid && (
              <button
                onClick={onOuvrirMourchid}
                className="card flex w-full items-center justify-between p-4 text-right hover:border-forest"
              >
                <span className="flex items-center gap-3">
                  <img src="/mascotte.webp" alt="" className="h-10 w-10 shrink-0 object-contain" />
                  <span>
                    <b className="text-sm text-forest">اسأل المُرشد</b>
                    <span className="mt-1 block text-xs text-mute">
                      25 سؤالًا في المنهجية بالنقر: قبل الامتحان، قراءة الموضوع، الكتابة، الأخطاء الشائعة، أثناء الامتحان — بلا إنترنت
                    </span>
                  </span>
                </span>
                <span className="text-mute">←</span>
              </button>
            )}

            <button onClick={() => setEcran('niveaux')} className="btn btn-gold w-full">
              مستويات التدريب الأربعة
            </button>
          </section>
        )}

        {ecran === 'operations' && (
          <section className="card p-5">
            <p className="eyebrow">قراءة الدليل · أصف / أفسّر / أحكم</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ثلاث عمليات قابلة للدمج</h2>
            <div className="mt-4 space-y-2">
              {operations.map(([title, question, language], i) => (
                <button
                  key={title}
                  onClick={() => setOperation(i)}
                  className={`w-full rounded-2xl border p-4 text-right ${
                    operation === i ? 'border-forest bg-sage-soft' : 'border-line bg-paper'
                  }`}
                >
                  <b className="text-sm text-forest">{title}</b>
                  <p className="mt-1 text-sm font-bold">{question}</p>
                  <p className="mt-1 text-xs text-mute">لغة مفيدة: {language}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/50 p-4">
              <p className="text-[11px] font-bold text-forest-deep">مثال</p>
              <p className="mt-1 text-sm leading-relaxed">
                <b>أصف:</b> النشاط يبلغ قيمة قصوى عند 37°C. <b>أفسّر:</b> لأن البنية الفراغية
                للإنزيم تكون مناسبة. <b>أحكم:</b> إذن للإنزيم درجة حرارة مثلى.
              </p>
            </div>
            <button onClick={() => setEcran('methode')} className="btn btn-primary mt-5 w-full">
              اختيار نوع التمرين
            </button>
          </section>
        )}

        {ecran === 'verbes' && (
          <section className="card p-5">
            <p className="eyebrow">دليل قراءة التعليمة</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ماذا يطلب منك الفعل؟</h2>
            {/* Tri contrasté — الأفعال المتقاربة جنبًا إلى جنب، لئلّا يخلط التلميذ بينها (audit F6). */}
            <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-3">
              <p className="text-[11px] font-black text-forest-deep">لا تخلط بين الأفعال المتقاربة</p>
              <div className="mt-2 divide-y divide-[#a3b899]">
                {contrastesVerbes.map(([a, defA, b, defB]) => (
                  <div key={`${a}-${b}`} className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 py-2 text-xs leading-snug">
                    <div className="text-right">
                      <b className="block text-forest">{a}</b>
                      <span className="mt-0.5 block text-mute">{defA}</span>
                    </div>
                    <span className="pt-1 font-black text-forest-deep">≠</span>
                    <div className="text-right">
                      <b className="block text-forest">{b}</b>
                      <span className="mt-0.5 block text-mute">{defB}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {verbes.map(([verbe, definition, exemple]) => (
                <article key={verbe} className="rounded-2xl border border-line bg-paper p-4">
                  <h3 className="text-sm font-bold text-forest">{verbe}</h3>
                  <p className="mt-1 text-sm font-bold">{definition}</p>
                  <p className="mt-2 rounded-xl bg-sage-soft p-2 text-xs font-bold leading-relaxed text-forest-deep">
                    مثال: {exemple}
                  </p>
                </article>
              ))}
            </div>
            <button onClick={startDiagnostic} className="btn btn-primary mt-5 w-full">
              اختبر نفسك — أيّ فعلٍ تقرأ؟
            </button>
          </section>
        )}

        {ecran === 'diagnostic' && (
          <section className="card p-6">
            <p className="eyebrow">
              تشخيص {q + 1} / {diagnostic.length}
            </p>
            <h2 className="font-naskh mt-2 text-xl font-bold">{diagnostic[q][0]}</h2>
            <div className="mt-5 grid gap-2">
              {diagnostic[q][1].map((option, i) => {
                // Rotation déterministe : le distrayant affiché n'est jamais le même index
                // d'une question à l'autre — la bonne réponse bouge (anti « position 0 »).
                const affiche = (i + rotationDiagnostic(q)) % 3;
                let style = 'border-line bg-paper';
                if (dernierFaux === affiche) style = 'border-clay bg-clay-soft text-clay';
                else if (selected === affiche) style = 'border-forest bg-sage text-forest-deep';
                return (
                  <button
                    key={option}
                    onClick={() => {
                      setSelected(affiche);
                      setErreur(false);
                      setDernierFaux(null);
                    }}
                    className={`rounded-2xl border p-4 text-right text-sm font-bold ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {erreur && (
              <p className="mt-3 rounded-xl bg-clay-soft px-3 py-2 text-sm font-bold leading-relaxed text-clay">
                {diagMsg || REFAIRE}
              </p>
            )}
            <button
              onClick={validerDiagnostic}
              disabled={selected === null}
              className="btn btn-primary mt-5 w-full"
            >
              تحقّق
            </button>
          </section>
        )}

        {ecran === 'resultat' && (
          <section className="card p-6">
            <p className="eyebrow">نتيجة التشخيص</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">
              حصلت على {score} / {diagnostic.length}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              {score === diagnostic.length
                ? 'منهجية صلبة — انتقل إلى المسارات وطبّقها على وثائق البكالوريا.'
                : 'ابدأ بمسار «من الملاحظة إلى الاستنتاج». حتى إذا كانت إجابتك جيدة، هذا المسار يثبت منهجية الإجابة. هذا التشخيص قابل لإعادة المحاولة متى شئت.'}
            </p>
            <button onClick={() => setEcran('niveaux')} className="btn btn-primary mt-5 w-full">
              اكتشف مستويات التدريب
            </button>
            <button onClick={startDiagnostic} className="btn btn-ghost mt-3 w-full">
              إعادة التشخيص
            </button>
          </section>
        )}

        {ecran === 'methode' && (
          <section className="card p-5">
            <p className="eyebrow">مسارات المنهجية</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">اختر نوع التمرين</h2>
            <div className="mt-4 space-y-2">
              {methodes.map(([title, chain], i) => (
                <button
                  key={title}
                  onClick={() => choisirMethode(i)}
                  className="w-full rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"
                >
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs font-bold text-forest">{chain}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setEcran('accueil')} className="btn btn-ghost mt-4 w-full">
              العودة إلى البداية
            </button>
          </section>
        )}

        {ecran === 'niveaux' && (
          <section className="card p-5">
            <p className="eyebrow">التدريب المتدرج</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">أربع مستويات نحو الاستقلال</h2>
            <div className="mt-4 space-y-3">
              {niveaux.map(([number, title, text]) => (
                <button
                  key={number}
                  onClick={() => setEcran('methode')}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper p-4 text-right"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">
                    {number}
                  </span>
                  <span>
                    <b className="text-sm">{title}</b>
                    <span className="mt-1 block text-xs text-mute">{text}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-gold-soft/50 p-3 text-xs leading-relaxed text-forest-deep">
              لا تنتقل إلى المستوى التالي لمجرد أنك قرأت الطريقة. النجاح يعني أن تنفذها في تمرين.
            </p>
            <button
              onClick={() => setEcran('unite1')}
              className="btn btn-primary mt-4 w-full"
            >
              الوحدة 1 · تركيب البروتين · 10 تمارين
            </button>
            <button onClick={demarrerEnquete} className="btn btn-gold mt-2 w-full">
              استقصاء · وثيقتان — تمرينا البكالوريا 2 و 3
            </button>
          </section>
        )}

        {ecran === 'unite1' && (
          <section className="space-y-4">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper">
                <p className="eyebrow text-paper/70">الوحدة 1 · تدريب بالوثائق والمخططات</p>
                <h2 className="font-naskh mt-2 text-2xl font-bold">تركيب البروتين</h2>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  عشرة تمارين مستوحاة من نمط الكتاب المدرسي: اقرأ الوثيقة، اختر الدليل، ثم ابنِ
                  جوابك.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-paper/15 px-3 py-1">10 تمارين</span>
                  <span className="rounded-full bg-paper/15 px-3 py-1">مخطط لكل تمرين</span>
                  <span className="rounded-full bg-paper/15 px-3 py-1">أقرأ السند</span>
                </div>
              </div>
            </div>
            <MascotteKunz
              compact
              tone="gold"
              message="كل تمرين جزيرة جديدة. اقرأ التعليمة، حدّد الفعل، ثم اجمع الأدلة قبل أن تبني جوابك."
            />
            <div className="space-y-3">
              {exercicesUnite1.map((item, i) => (
                <article key={item.titre} className="card overflow-hidden">
                  <button
                    onClick={() => choisirExerciceUnite1(i)}
                    className="flex w-full items-center gap-3 p-4 text-right hover:bg-sage-soft"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-forest">
                        {item.format} · {item.verbe}
                      </span>
                      <b className="mt-1 block text-base">{item.titre}</b>
                      <span className="mt-1 block text-[11px] text-mute">{item.document}</span>
                    </span>
                    <span className="text-mute">←</span>
                  </button>
                  <div className="border-t border-line bg-paper px-3 pb-3">
                    <SchemaUnite1 type={item.diagramme} />
                  </div>
                </article>
              ))}
            </div>
            <button onClick={() => setEcran('niveaux')} className="btn btn-ghost w-full">
              العودة إلى مستويات التدريب
            </button>
          </section>
        )}

        {ecran === 'exercice' && sourceExo === 'unite1' && (
          <section className="card p-6">
            <p className="eyebrow">
              تمرين {methode + 1} / {exercicesUnite1.length} · {exoU1.format}
            </p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{exoU1.titre}</h2>
            <p className="mt-2 text-sm text-mute">
              {exoU1.document} · الهدف: {exoU1.objectif}
            </p>
            <MascotteKunz
              compact
              tone="gold"
              message="قبل أن تكتب: ما هو الفعل؟ أين الدليل؟ وهل جوابك يجيب عن السؤال نفسه؟"
            />
            <div className="mt-4 rounded-2xl border border-line bg-paper p-2">
              <SchemaUnite1 type={exoU1.diagramme} />
            </div>
            <div className="mt-3 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">وثيقة تفاعلية · اختر المنطقة</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoU1.question}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {exoU1.zones.map((zone, i) => (
                  <button
                    key={zone}
                    onClick={() => setZoneActive(i)}
                    className={`rounded-xl border p-2 text-xs font-bold transition ${
                      zoneActive === i
                        ? 'border-forest bg-forest text-paper'
                        : 'border-line bg-paper text-forest-deep'
                    }`}
                  >
                    {lettreZone(i)} · {zone}
                  </button>
                ))}
              </div>
              {zoneActive !== null && (
                <p className="mt-3 rounded-xl bg-paper p-2 text-xs font-bold text-forest">
                  الدليل المحدد: المنطقة {lettreZone(zoneActive)} · {exoU1.zones[zoneActive]}
                </p>
              )}
            </div>
            <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">فعل</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoU1.consigne}</p>
            </div>
            {zoneActive === null ? (
              <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                <p className="text-[11px] font-bold text-forest-deep">دليل · قبل أن تجيب</p>
                <p className="mt-1 text-sm leading-relaxed">
                  استخرج الدليل بنفسك: انقر أعلاه على المنطقة التي تمثّل المعطى النافع في المخطط،
                  ثم اكتب جوابك.
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-sage bg-sage-soft p-4">
                <p className="text-[11px] font-bold text-forest">دليل · قارن اختيارك بالمرجع</p>
                <p className="mt-1 text-sm leading-relaxed">{exoU1.preuve}</p>
              </div>
            )}
            <div className="mt-3 rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold text-forest">جواب</p>
              <p className="mt-2 text-sm leading-relaxed">
                اكتب جوابك ذهنيًا، ثم اختر ما يطابق المنهجية:
              </p>
              <div className="mt-3 grid gap-2">
                {optionsU1.map((option, i) => {
                  let style = 'border-line bg-paper';
                  if (dernierFauxExo === i) style = 'border-clay bg-clay-soft text-clay';
                  else if (justeExo && i === idxJusteU1) style = 'border-forest bg-sage text-forest-deep';
                  else if (reponse === i) style = 'border-forest bg-sage text-forest-deep';
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        if (justeExo) return;
                        setReponse(i);
                        setDernierFauxExo(null);
                        setFeedback('');
                      }}
                      className={`rounded-2xl border p-3 text-right text-sm leading-relaxed ${style}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* سلّم المساعدة — 3 barreaux demandés par l'élève, proposés après la 2ᵉ erreur (audit). */}
            {!justeExo && (
              <div className="mt-4 space-y-3">
                {fauxExo >= 2 && barreaux === 0 && (
                  <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-3 text-sm leading-relaxed">
                    يبدو أن الجواب يدور حولك. جرّب «التلميح»: يريك أين تنظر في المخطط، ولا ينطق
                    بالجواب أبدًا.
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setBarreaux((p) => Math.min(p + 1, 3))}
                    disabled={barreaux >= 3}
                    className={`btn btn-ghost !px-3 text-sm ${
                      fauxExo >= 2 && barreaux === 0 ? '!border-gold !text-forest-deep' : ''
                    }`}
                  >
                    💡 التلميح · {barreaux}/3
                  </button>
                  <span className="text-[11px] text-mute">
                    المساعدة لا تُخفف رصيدًا ولا تُنقص شيئًا.
                  </span>
                </div>
                {barreaux >= 1 && (
                  <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                    <p className="text-[11px] font-bold text-forest-deep">تلميح 1 · أين تنظر؟</p>
                    <p className="mt-1 text-sm leading-relaxed text-forest-deep">{aide[0]}</p>
                  </div>
                )}
                {barreaux >= 2 && (
                  <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                    <p className="text-[11px] font-bold text-forest-deep">تلميح 2 · أي عملية؟</p>
                    <p className="mt-1 text-sm leading-relaxed text-forest-deep">{aide[1]}</p>
                  </div>
                )}
                {barreaux >= 3 && (
                  <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                    <p className="text-[11px] font-bold text-forest-deep">تلميح 3 · القاعدة العامة</p>
                    <p className="mt-1 text-sm leading-relaxed text-forest-deep">{aide[2]}</p>
                    <button ref={ouvrirAide} onClick={() => setAideBoussole(true)} className="btn btn-ghost mt-3 w-full">
                      أفتح البوصلة وأعود إلى تمريني
                    </button>
                  </div>
                )}
              </div>
            )}
            {feedback && (
              <div
                className={`mt-3 rounded-2xl p-4 text-sm leading-relaxed ${
                  feedbackTon === 'juste'
                    ? 'bg-sage-soft text-forest-deep'
                    : 'bg-clay-soft text-clay'
                }`}
              >
                <b>{feedbackTon === 'juste' ? 'فحص · تصحيح تدريجي' : 'فحص'}</b>
                <p className="mt-1">{feedback}</p>
                {feedbackTon === 'juste' && (
                  <p className="mt-2 text-xs font-bold text-forest">
                    خطأ شائع: {exoU1.erreur}
                  </p>
                )}
              </div>
            )}
            {!justeExo && (
              <button
                onClick={validerExercice}
                disabled={reponse === null || zoneActive === null}
                className="btn btn-primary mt-4 w-full"
              >
                افحص جوابي
              </button>
            )}
            {!justeExo ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEcran('unite1');
                    reinitialiserExercice();
                  }}
                  className="btn btn-ghost"
                >
                  قائمة التمارين
                </button>
                <button
                  onClick={() => {
                    setReponse(null);
                    setFeedback('');
                    setDernierFauxExo(null);
                  }}
                  className="btn btn-ghost"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <button onClick={ouvrirRedaction} className="btn btn-primary w-full">
                  ابنِ جوابك الكامل · بطاقات ←
                </button>
                <button
                  onClick={() => {
                    setEcran('unite1');
                    reinitialiserExercice();
                  }}
                  className="btn btn-ghost w-full"
                >
                  قائمة التمارين
                </button>
              </div>
            )}
          </section>
        )}

        {aideBoussole && <AideBoussole document={exoU1.document} verbe={exoU1.verbe} onBoussoleEvent={onBoussoleEvent} onFermer={() => { setAideBoussole(false); requestAnimationFrame(() => ouvrirAide.current?.focus({ preventScroll: true })); }} />}

        {ecran === 'redaction' && redactionSource === 'enquete' && (
          <section className="card p-6">
            <p className="eyebrow">
              استقصاء · وثيقتان · تمرين {enqueteId + 1} من {exercicesEnquete.length} ·{' '}
              {modeleEnquete.cloze ? 'محرّر فراغات' : 'محرّر 5 بطاقات'}
            </p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">
              {modeleEnquete.cloze
                ? 'ابنِ جوابك النهائي · أكمل الفراغات'
                : 'ابنِ جوابك النهائي · بطاقات'}
            </h2>
            <p className="mt-2 text-sm text-mute">
              {exoEnquete.situation} —{' '}
              {modeleEnquete.cloze
                ? 'أكمل كل فراغ بالكلمة المناسبة من الاختيار الثلاثي: أنت تنتج الجواب كلمةً كلمة، لا تختار جملة جاهزة.'
                : 'ابنِ الجواب كاملًا: المقدمة، ثم الوثيقة 1، ثم الوثيقة 2، ثم العلاقة، ثم الخلاصة. دون كتابة ولا لوحة مفاتيح.'}
            </p>
            <div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
              <p className="text-[11px] font-bold text-forest-deep">سؤال البكالوريا</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoEnquete.question}</p>
            </div>
            {/* Bande supérieure : les deux documents restent visibles (mémoire de travail préservée). */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-[11px] font-bold text-forest">{exoEnquete.doc1.titre}</p>
                <p className="mt-1.5 text-sm font-bold leading-relaxed text-forest-deep">
                  {exoEnquete.doc1.contenu}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-[11px] font-bold text-forest">{exoEnquete.doc2.titre}</p>
                <p className="mt-1.5 text-sm font-bold leading-relaxed text-forest-deep">
                  {exoEnquete.doc2.contenu}
                </p>
              </div>
            </div>
            {/* Grille de barème cochée à la pose de chaque tuile (audit : barème réel, pas décoratif). */}
            <div className="mt-4 flex flex-wrap gap-2">
              {GRILLE_BAREME.map((g) => {
                const coche = tuilesChoisies.length > g.depuisSlot;
                return (
                  <span
                    key={g.code}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      coche ? 'bg-sage text-forest-deep' : 'border border-line bg-paper text-mute'
                    }`}
                  >
                    {coche ? '✓' : '·'} {g.code}
                  </span>
                );
              })}
            </div>
            {/* Les 5 emplacements du barème : un seul actif à la fois (porte dure interne). */}
            <div className="mt-4 space-y-2">
              {TUILES_BAREME.map((t, i) => {
                const rempli = i < tuilesChoisies.length;
                const actif = !redactionFin && i === slotRedaction;
                return (
                  <div
                    key={t.label}
                    className={`rounded-2xl border p-3 text-sm leading-relaxed ${
                      rempli
                        ? 'border-forest bg-sage-soft text-forest-deep'
                        : actif
                          ? 'border-dashed border-forest bg-paper font-bold text-forest'
                          : 'border-dashed border-line bg-paper text-mute'
                    }`}
                  >
                    <p className="text-[11px] font-bold">
                      {i + 1} · {t.label} — {t.note}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                      {rempli
                        ? tuilesChoisies[i]
                        : actif
                          ? slotClozeActif
                            ? gabaritCloze(modeleEnquete, i, blancRedaction)
                            : '▸ اختر البطاقة المناسبة أدناه'
                          : 'مسودة مغلقة — أتمّ ما قبله أولًا.'}
                    </p>
                  </div>
                );
              })}
            </div>

            {!redactionFin && (
              <div className="mt-3 grid gap-2">
                {slotClozeActif && (
                  <p className="text-[11px] font-bold text-forest">
                    الفراغ {blancRedaction + 1} من {slotClozeActif.blancs.length} — اختر الكلمة المناسبة
                  </p>
                )}
                {(slotClozeActif
                  ? tuilesClozeEmplacement(enqueteId, slotRedaction, blancRedaction, varianteRedaction)
                      .options
                  : tuilesEmplacementEnquete(enqueteId, slotRedaction, varianteRedaction).options
                ).map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => choisirTuile(idx)}
                      className={`rounded-2xl border p-3 text-right text-sm leading-relaxed ${
                        tuileFausse === idx
                          ? 'border-clay bg-clay-soft text-clay'
                          : 'border-line bg-paper'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                {diagnoRedaction && tuileFausse !== null && (
                  <p className="rounded-2xl bg-clay-soft p-3 text-sm font-bold leading-relaxed text-clay">
                    {diagnoRedaction} — أعد النظر، ثم جرّب {slotClozeActif ? 'كلمة أخرى' : 'بطاقة أخرى'}.
                  </p>
                )}
                {tuileFausse !== null && !diagnoRedaction && (
                  <p className="rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">
                    {slotClozeActif
                      ? 'ليست الكلمة المناسبة — استثمر المعطيات واستنتج قبل اختيار بديل.'
                      : 'ليست البطاقة المناسبة — أعد النظر في مكانها في الجواب. خذ وقتك، لا عجلة.'}
                  </p>
                )}
              </div>
            )}

            {redactionFin && (
              <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
                <div id="zone-impression">
                  <p className="text-[11px] font-bold text-forest">جوابك المُركّب · للطباعة</p>
                  <p className="mt-2 text-sm leading-relaxed text-forest-deep">
                    {tuilesChoisies.join(' ')}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => window.print()} className="btn btn-ghost !px-3 text-sm">
                    🖨️ اطبع الجواب
                  </button>
                  <span className="text-[11px] text-mute">علامات كاملة لدى بناء البطاقات الخمس.</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-forest-deep">
                  خطأ شائع: {exoEnquete.erreur}
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSlotRedaction(0);
                  setTuilesChoisies([]);
                  setTuileFausse(null);
                  setRedactionFin(false);
                  setFauxRedaction(0);
                  setVarianteRedaction(0);
                  setDiagnoRedaction('');
                  setBlancRedaction(0);
                }}
                className="btn btn-ghost"
              >
                إعادة البناء
              </button>
              <button
                onClick={() => setEcran('enquete')}
                className="btn btn-ghost"
              >
                العودة إلى الاستقصاء
              </button>
            </div>
          </section>
        )}

        {ecran === 'redaction' && redactionSource !== 'enquete' && (
          <section className="card p-6">
            <p className="eyebrow">
              {exoU1.format} · {exoU1.verbe}
            </p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ابنِ جوابك · بطاقات</h2>
            <p className="mt-2 text-sm text-mute">
              {exoU1.document} · رتّب البطاقات لِتُكوّن جوابًا علميًا كاملًا، دون كتابة ولا لوحة
              مفاتيح.
            </p>
            <div className="mt-4 rounded-2xl border border-line bg-paper p-2">
              <SchemaUnite1 type={exoU1.diagramme} />
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold text-forest">
                البطاقة {slotRedaction + 1} من {segmentsU1.length}
              </p>
              <div className="mt-3 space-y-2 text-sm leading-relaxed">
                {segmentsU1.map((_, i) => {
                  if (i < tuilesChoisies.length) {
                    return (
                      <p key={i} className="rounded-xl bg-sage-soft p-2 text-forest-deep">
                        {tuilesChoisies[i]}
                      </p>
                    );
                  }
                  if (i === slotRedaction && !redactionFin) {
                    return (
                      <p
                        key={i}
                        className="rounded-xl border border-dashed border-forest p-2 font-bold text-forest"
                      >
                        ▸ اختر البطاقة المناسبة أدناه
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="rounded-xl border border-dashed border-line p-2 text-mute">
                      …
                    </p>
                  );
                })}
              </div>
            </div>

            {!redactionFin && (
              <div className="mt-3 grid gap-2">
                {tuilesEmplacement(methode, slotRedaction).options.map((opt, idx) => (
                  <button
                    key={opt}
                    onClick={() => choisirTuile(idx)}
                    className={`rounded-2xl border p-3 text-right text-sm leading-relaxed ${
                      tuileFausse === idx
                        ? 'border-clay bg-clay-soft text-clay'
                        : 'border-line bg-paper'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                {tuileFausse !== null && (
                  <p className="rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">
                    ليست البطاقة المناسبة — أعد النظر في تسلسل الجواب. خذ وقتك، لا عجلة.
                  </p>
                )}
              </div>
            )}

            {redactionFin && (
              <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
                <p className="text-[11px] font-bold text-forest">جوابك المُركّب</p>
                <p className="mt-2 text-sm leading-relaxed">{tuilesChoisies.join(' ')}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-forest">
                  <span className="rounded-full bg-paper px-3 py-1">✓ سند</span>
                  <span className="rounded-full bg-paper px-3 py-1">✓ تحليل</span>
                  <span className="rounded-full bg-paper px-3 py-1">✓ ربط</span>
                  <span className="rounded-full bg-paper px-3 py-1">✓ استنتاج</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-forest-deep">
                  خطأ شائع: {exoU1.erreur}
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSlotRedaction(0);
                  setTuilesChoisies([]);
                  setTuileFausse(null);
                  setRedactionFin(false);
                }}
                className="btn btn-ghost"
              >
                إعادة البناء
              </button>
              <button onClick={() => setEcran('unite1')} className="btn btn-ghost">
                قائمة التمارين
              </button>
            </div>
          </section>
        )}

        {ecran === 'exercice' && sourceExo === 'chemin' && (
          <section className="card p-6">
            <p className="eyebrow">مسار · {methodes[methode][0]}</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{methodes[methode][1]}</h2>
            <MascotteKunz
              compact
              tone="gold"
              message={`لا تفسّر قبل أن تصف؛ رتّب خطوات «${methodes[methode][0]}» بالترتيب المناسب لهذا المسعى.`}
            />
            <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold text-forest">السند · تمرين هذا المسار</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed text-forest-deep">
                {exoMethode.document}
              </p>
            </div>
            <p className="mt-4 text-sm font-bold">{exoMethode.question}</p>
            <div className="mt-3 grid gap-2">
              {optionsChemin.map((option, i) => {
                let style = 'border-line bg-paper';
                if (dernierFauxExo === i) style = 'border-clay bg-clay-soft text-clay';
                else if (justeExo && i === idxJusteChemin) style = 'border-forest bg-sage text-forest-deep';
                else if (reponse === i) style = 'border-forest bg-sage text-forest-deep';
                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (justeExo) return;
                      setReponse(i);
                      setDernierFauxExo(null);
                      setFeedback('');
                    }}
                    className={`rounded-2xl border p-3 text-right text-sm font-bold ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {feedback && (
              <div
                className={`mt-3 rounded-2xl p-4 text-sm leading-relaxed ${
                  feedbackTon === 'juste'
                    ? 'bg-sage-soft text-forest-deep'
                    : 'bg-clay-soft text-clay'
                }`}
              >
                <b>{feedbackTon === 'juste' ? 'فحص · تصحيح تدريجي' : 'فحص'}</b>
                <p className="mt-1">{feedback}</p>
              </div>
            )}
            {!justeExo && (
              <button
                onClick={validerExercice}
                disabled={reponse === null}
                className="btn btn-primary mt-5 w-full"
              >
                تحقّق من طريقة التفكير
              </button>
            )}
            {justeExo && (
              <p className="mt-3 rounded-2xl bg-sage-soft p-3 text-center text-xs font-bold text-forest">
                قاعدة دائمة: وصف ← تفسير ← استنتاج، بلا استعجال وبلا معلومة من الدرس بدل السند.
              </p>
            )}
            <button
              onClick={() => {
                setEcran('methode');
                setReponse(null);
                setFeedback('');
                setDernierFauxExo(null);
                setJusteExo(false);
                setBarreaux(0);
                setFauxExo(0);
              }}
              className="btn btn-ghost mt-3 w-full"
            >
              اختيار طريقة أخرى
            </button>
          </section>
        )}

        {ecran === 'enquete' && (
          <section className="card p-6">
            <p className="eyebrow">
              استقصاء · وثيقتان · تمرين {enqueteId + 1} من {exercicesEnquete.length}
            </p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{exoEnquete.titre}</h2>
            <p className="mt-2 text-sm text-mute">{exoEnquete.situation}</p>
            <MascotteKunz
              compact
              tone="gold"
              message="الحكاية قبل الجواب: اقرأ الوثيقتين، قارن بنفس المعيار، ثم استنتج بلا تعميم متسرّع."
            />
            <div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
              <p className="text-[11px] font-bold text-forest-deep">سؤال البكالوريا</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoEnquete.question}</p>
            </div>
            {/* Les deux documents restent affichés pendant toute la résolution (mémoire de travail). */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-[11px] font-bold text-forest">{exoEnquete.doc1.titre}</p>
                <p className="mt-1.5 text-sm font-bold leading-relaxed text-forest-deep">
                  {exoEnquete.doc1.contenu}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-[11px] font-bold text-forest">{exoEnquete.doc2.titre}</p>
                <p className="mt-1.5 text-sm font-bold leading-relaxed text-forest-deep">
                  {exoEnquete.doc2.contenu}
                </p>
              </div>
            </div>
            {/* Déroulé des 4 خطوات */}
            <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
              {ETAPES_ENQUETE.map((label, i) => {
                const passe = i < etapeEnq || enqueteFin;
                const actif = !enqueteFin && i === etapeEnq;
                return (
                  <span
                    key={label}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                      passe
                        ? 'bg-sage text-forest-deep'
                        : actif
                          ? 'border border-forest bg-paper text-forest'
                          : 'border border-line bg-paper text-mute'
                    }`}
                  >
                    {passe || actif ? '✓' : i + 1} · {label}
                  </span>
                );
              })}
            </div>
            {!enqueteFin ? (
              <>
                <p className="mt-4 text-sm font-bold">{etapeActuelle.question}</p>
                <div className="mt-3 grid gap-2">
                  {optionsEnq.map((option, i) => {
                    let style = 'border-line bg-paper';
                    if (dernierFauxExo === i) style = 'border-clay bg-clay-soft text-clay';
                    else if (justeExo && i === idxJusteEnq)
                      style = 'border-forest bg-sage text-forest-deep';
                    else if (reponse === i) style = 'border-forest bg-sage text-forest-deep';
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          if (justeExo) return;
                          setReponse(i);
                          setDernierFauxExo(null);
                          setFeedback('');
                        }}
                        className={`rounded-2xl border p-3 text-right text-sm leading-relaxed ${style}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {/* سلّم المساعدة — 3 barreaux par étape, proposés après la 2ᵉ erreur. */}
                {!justeExo && (
                  <div className="mt-4 space-y-3">
                    {fauxExo >= 2 && barreaux === 0 && (
                      <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-3 text-sm leading-relaxed">
                        يبدو أنك عالق. جرّب «التلميح»: يريك أين تنظر في الوثيقة، ولا ينطق بالجواب
                        أبدًا.
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setBarreaux((p) => Math.min(p + 1, 3));
                          setAideEnquete(true);
                        }}
                        disabled={barreaux >= 3}
                        className={`btn btn-ghost !px-3 text-sm ${
                          fauxExo >= 2 && barreaux === 0 ? '!border-gold !text-forest-deep' : ''
                        }`}
                      >
                        💡 التلميح · {barreaux}/3
                      </button>
                      <span className="text-[11px] text-mute">
                        المساعدة لا تُخفف رصيدًا ولا تُنقص شيئًا.
                      </span>
                    </div>
                    {barreaux >= 1 && (
                      <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                        <p className="text-[11px] font-bold text-forest-deep">تلميح 1 · أين تنظر؟</p>
                        <p className="mt-1 text-sm leading-relaxed text-forest-deep">
                          {etapeActuelle.regard}
                        </p>
                      </div>
                    )}
                    {barreaux >= 2 && (
                      <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                        <p className="text-[11px] font-bold text-forest-deep">تلميح 2 · أي عملية؟</p>
                        <p className="mt-1 text-sm leading-relaxed text-forest-deep">
                          {etapeActuelle.operation}
                        </p>
                      </div>
                    )}
                    {barreaux >= 3 && (
                      <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                        <p className="text-[11px] font-bold text-forest-deep">
                          تلميح 3 · القاعدة العامة
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-forest-deep">
                          {etapeActuelle.regle}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {feedback && (
                  <div
                    className={`mt-3 rounded-2xl p-4 text-sm leading-relaxed ${
                      feedbackTon === 'juste'
                        ? 'bg-sage-soft text-forest-deep'
                        : 'bg-clay-soft text-clay'
                    }`}
                  >
                    <b>{feedbackTon === 'juste' ? 'فحص · تصحيح تدريجي' : 'فحص'}</b>
                    <p className="mt-1">{feedback}</p>
                  </div>
                )}
                {!justeExo ? (
                  <>
                    <button
                      onClick={validerEnquete}
                      disabled={reponse === null}
                      className="btn btn-primary mt-5 w-full"
                    >
                      افحص هذه الخطوة
                    </button>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={retryEtapeEnquete} className="btn btn-ghost">
                        إعادة المحاولة
                      </button>
                      <button
                        onClick={() => choisirEnquete(enqueteId + 1)}
                        className="btn btn-ghost"
                      >
                        تمرين آخر
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={passerEtapeEnquete}
                    className="btn btn-primary mt-5 w-full"
                  >
                    الخطوة التالية ←
                  </button>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4">
                <p className="text-[11px] font-bold text-forest">
                  استنتاج مبرّر · الجواب النموذجي
                </p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-forest-deep">
                  {exoEnquete.conclusion}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-forest-deep">
                  خطأ شائع: {exoEnquete.erreur}
                </p>
              </div>
            )}
            {enqueteFin && (
              <div className="mt-4 space-y-2">
                <button onClick={ouvrirRedactionEnquete} className="btn btn-primary w-full">
                  {modeleEnquete.cloze
                    ? 'ابنِ جوابك النهائي · أكمل الفراغات ←'
                    : 'ابنِ جوابك النهائي · بطاقات ←'}
                </button>
                <button
                  onClick={() => choisirEnquete(enqueteId + 1)}
                  className="btn btn-ghost w-full"
                >
                  تمرين آخر
                </button>
                <button
                  onClick={() => {
                    setEcran('accueil');
                    reinitialiserEnquete();
                  }}
                  className="btn btn-ghost w-full"
                >
                  العودة إلى البداية
                </button>
              </div>
            )}
          </section>
        )}

        {ecran === 'autopsie' && (
          <section className="card p-5">
            <p className="eyebrow">تشريح نسخة · عين المصحّح · تمرين 2 من 3</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ابحث عن الأخطاء الأربعة</h2>
            <p className="mt-2 text-sm text-mute">
              نسخة تلميذ يجيب عن سؤال البكالوريا. انقر كل عبارة تراها مخالفة لطريقة «السند ← دليل ←
              جواب»: كل اكتشاف صائب يكشف المعيار الذي خالفته العبارة؛ وسمٌ لعبارة سليمة يُحتسب خطأ،
              والمصحّح يتعلم أيضًا.
            </p>

            {/* La copie du candidat, style papier crème. */}
            <div className="mt-4 rounded-2xl border border-gold-soft bg-cream p-4">
              <div className="flex items-center justify-between border-b border-gold-soft pb-2">
                <p className="text-[11px] font-bold text-forest-deep">
                  نسخة تلميذ · بكالوريا علوم تجريبية · تمرين 2 (4 نقاط)
                </p>
                <span aria-hidden>🖋</span>
              </div>
              <p className="mt-3 rounded-xl bg-paper p-3 text-sm font-bold leading-relaxed">
                <span className="text-[11px] font-bold text-forest">التعليمة: </span>
                {COPIE_AUTOPSIE.consigne}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-mute">
                سند: {COPIE_AUTOPSIE.snd}
              </p>
              <div className="mt-3 space-y-2">
                {COPIE_AUTOPSIE.clauses.map((c) => {
                  const trouvee = autopsieTiques.includes(c.id);
                  const revelee = autopsieRevele === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => tiquerClause(c.id)}
                      className={`w-full rounded-xl border p-3 text-right text-sm leading-relaxed transition-colors ${
                        trouvee
                          ? 'border-clay bg-clay-soft text-clay line-through decoration-clay'
                          : revelee && !c.fautive
                            ? 'border-gold-soft bg-gold-soft/40'
                            : 'border-line bg-paper hover:border-forest'
                      }`}
                    >
                      {c.texte}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compteur de l'inspecteur : fautes découvertes / faux positifs. */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-forest-deep">
                أخطاء مكتشفة {autopsieTiques.length} من {nbFautesAutopsie}
              </span>
              <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-bold text-mute">
                وسوم خاطئة {autopsieFaux}
              </span>
            </div>

            {clauseAutopsieRevelee && !autopsieFin && (
              <>
                {clauseAutopsieRevelee.fautive ? (
                  <div className="mt-3 rounded-2xl border border-clay bg-clay-soft p-4">
                    <p className="text-[11px] font-bold text-clay">
                      معيار مخالف:{' '}
                      {clauseAutopsieRevelee.type ? LIBELLE_FAUTE[clauseAutopsieRevelee.type] : ''}
                      {' · '}
                      {clauseAutopsieRevelee.critere}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-clay">
                      {clauseAutopsieRevelee.diagnostic}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                    <p className="text-[11px] font-bold text-forest-deep">
                      وسم خاطئ · العبارة سليمة
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-forest-deep">
                      {clauseAutopsieRevelee.raisonSaine}
                    </p>
                  </div>
                )}
              </>
            )}

            {autopsieFin && (
              <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
                <div id="zone-autopsie-modele">
                  <p className="text-[11px] font-bold text-forest">الجواب النموذجي بعد التشريح</p>
                  <p className="mt-2 text-sm leading-relaxed text-forest-deep">
                    {COPIE_AUTOPSIE.modeleComplet}
                  </p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-forest-deep">
                  {autopsieFaux > 0
                    ? `كشفت الأخطاء الأربعة مع ${autopsieFaux} وسم خاطئ — أعد قراءة الأعداد قبل الحكم، وعين المصحّح تتشكل.`
                    : 'اكتشفت الأخطاء الأربعة من أول مرة بلا وسم خاطئ: عين مصحّح مشرّفة.'}
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={demarrerAutopsie} className="btn btn-ghost">
                إعادة التشريح
              </button>
              <button onClick={() => setEcran('accueil')} className="btn btn-ghost">
                العودة إلى البداية
              </button>
            </div>
          </section>
        )}

        {ecran === 'diagrammes' && (
          <section className="card p-5">
            <p className="eyebrow">مكتبة المخططات</p>
            <h2 className="font-naskh mt-1 text-2xl font-bold">مخططات المجال الأول</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              {nb(DIAGRAMMES.length)} مخططات تغطي المجال الأول (تركيب البروتين) — للمراجعة البصرية قبل التمارين. (مخططات التسمية التفاعلية ستأتي لاحقًا.)
            </p>
            <MascotteKunz
              compact
              tone="gold"
              message="كل مخطط بوابة لفهم آلية بيولوجية: سمِّ العناصر بصوت خافت قبل قراءة الرقعات، ثم قارن."
            />
            <div className="mt-4 space-y-4">
              {DIAGRAMMES.map((d, i) => (
                <article key={d.id} className="card overflow-hidden">
                  <div className="flex items-center gap-4 p-4 bg-sage-soft/50">
                    <span className="shrink-0 grid h-10 w-10 place-items-center rounded-xl bg-forest text-xs font-bold text-paper">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{d.titre}</p>
                      <p className="text-xs text-mute">{d.description}</p>
                    </div>
                    <SchemaUnite1 type={d.type} className="h-12 w-12 shrink-0 opacity-80" />
                  </div>
                  <div className="border-t border-line bg-paper px-4 py-3">
                    <SchemaUnite1 type={d.type} />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.zones.map((zone, zi) => (
                        <span key={zone} className="chip text-[10px] bg-sage-soft text-forest-deep">
                          {String.fromCharCode(65 + zi)} {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button onClick={() => setEcran('accueil')} className="btn btn-ghost mt-4 w-full">
              العودة إلى البداية
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
