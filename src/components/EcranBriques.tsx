// Chargement paresseux du catalogue de briques, puis écran 1-2-3.
//
// Le catalogue est un import dynamique (une unité = un chunk) : la coquille hors-ligne ne
// grossit pas, et l'élève qui n'ouvre pas l'atelier ne télécharge aucun jeu.

import { useEffect, useState } from 'react';
import { chargerJeuxUnite, chargerJeuxSujet } from '../data/briques';
import { UNITES, UNITE_PAR_ID } from '../data/programme';
import type { Etat } from '../types';
import type { EvaluationBriques, JeuBriques } from '../utils/briques';
import Ecran123 from './Ecran123';

interface Props {
  etat: Etat;
  /** Unité ciblée ; `undefined` = liste des unités qui ont du contenu. */
  uniteId?: string;
  /** Sujet Bac (gabarit pilote) : charge les jeux du sujet au lieu de ceux de l'unité. */
  sujetId?: string;
  onFermer: () => void;
  onTentative: (jeu: JeuBriques, ids: string[], evaluation: EvaluationBriques) => void;
}

export default function EcranBriques({ etat, uniteId, sujetId, onFermer, onTentative }: Props) {
  const [jeux, setJeux] = useState<JeuBriques[] | null>(null);
  const [cible, setCible] = useState<string | undefined>(uniteId);

  useEffect(() => {
    let vivant = true;
    setJeux(null);
    const charger = sujetId
      ? chargerJeuxSujet(sujetId)
      : cible
        ? chargerJeuxUnite(cible)
        : Promise.resolve([]);
    void charger.then((liste) => {
      if (vivant) setJeux(liste);
    });
    return () => {
      vivant = false;
    };
  }, [cible, sujetId]);

  if (jeux === null) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="oeil">البوصلة 1-2-3</p>
        <p className="petit doux mt-2">نجهّز التمارين…</p>
      </div>
    );
  }

  if (!sujetId && !cible) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <p className="oeil">البوصلة 1-2-3</p>
        <h1 className="titre-1 mt-1">اختر وحدة</h1>
        <p className="petit doux mt-1">
          التمارين المبنيّة بالبنى متوفّرة أوّلًا في الوحدة 1؛ الباقي يأتي بالتدريج وبعد المراجعة.
        </p>
        <div className="mt-3 space-y-2">
          {UNITES.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setCible(u.id)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-right transition hover:border-forest"
            >
              <span className="mention">الوحدة {u.numero}</span>
              <p className="mt-1 text-sm font-bold text-ink">{u.titre}</p>
            </button>
          ))}
        </div>
        <button type="button" className="btn-mini mt-4 w-full" onClick={onFermer}>
          رجوع
        </button>
      </div>
    );
  }

  if (jeux.length === 0) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <p className="oeil">البوصلة 1-2-3</p>
        <h1 className="titre-1 mt-1">ما زال ما عندناش تمارين هنا</h1>
        <p className="petit doux mt-1">
          {cible ? `الوحدة ${UNITE_PAR_ID[cible]?.numero ?? ''} ` : ''}
          بدون بنى بعد — نستعملو التمارين العادية إلى أن يأتي المحتوى بعد المراجعة.
        </p>
        <button type="button" className="btn--secondaire mt-4 w-full" onClick={() => setCible(undefined)}>
          اختر وحدة أخرى
        </button>
        <button type="button" className="btn-mini mt-2 w-full" onClick={onFermer}>
          رجوع
        </button>
      </div>
    );
  }

  return (
    <Ecran123
      etat={etat}
      jeux={jeux}
      titre={sujetId ? `موضوع ${sujetId}` : `الوحدة ${UNITE_PAR_ID[cible ?? '']?.numero ?? ''}`}
      onFermer={onFermer}
      onTentative={onTentative}
    />
  );
}
