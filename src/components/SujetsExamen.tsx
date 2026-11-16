// بوصلة العلوم —Liste des sujets d'examen Bac SVT (Phase 1.1)
// Navigation par année/session, ouverture PDF natif (pas de viewer maison)

import { useState, useMemo } from 'react';
import type { SujetExamen } from '../data/examSubjects';
import { SUJETS_EXAMEN, getSujetsParAnnee } from '../data/examSubjects';
import { IcoRetour, IcoDocument, IcoDownload } from './Icones';
import MascotteKunz from './MascotteKunz';

interface Props {
  onFermer: () => void;
}

export default function SujetsExamen({ onFermer }: Props) {
  const [serieFiltre, setSerieFiltre] = useState<'toutes' | 'SVT' | 'Sciences Naturelles'>('toutes');

  const sujetsFiltres = useMemo(() => {
    let liste = SUJETS_EXAMEN;
    if (serieFiltre !== 'toutes') {
      liste = liste.filter(s => s.serie === serieFiltre);
    }
    return liste.sort((a, b) => b.annee - a.annee);
  }, [serieFiltre]);

  const anneesDisponibles = useMemo(() => {
    const set = new Set(sujetsFiltres.map(s => s.annee));
    return Array.from(set).sort((a, b) => b - a);
  }, [sujetsFiltres]);

  const sujetsParAnnee = useMemo(() => {
    const map = new Map<number, SujetExamen[]>();
    for (const s of sujetsFiltres) {
      const arr = map.get(s.annee) ?? [];
      arr.push(s);
      map.set(s.annee, arr);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => {
        const order = { juin: 0, septembre: 1, rattrapage: 2 };
        return order[a.session] - order[b.session];
      });
    }
    return map;
  }, [sujetsFiltres]);

  function formaterTaille(octets: number): string {
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  function getSessionLabel(session: string): string {
    return { juin: 'Juin', septembre: 'Septembre', rattrapage: 'Rattrapage' }[session] ?? session;
  }

  function ouvrirPDF(fichier: string): void {
    window.open(`/${fichier}`, '_blank', 'noopener,noreferrer');
  }

  function telechargerPDF(fichier: string, titre: string): void {
    const a = document.createElement('a');
    a.href = `/${fichier}`;
    a.download = titre + '.pdf';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <button onClick={onFermer} className="btn btn-ghost mb-6">
          <span className="block h-5 w-5"><IcoRetour /></span>
          Retour aux exercices
        </button>

        <MascotteKunz
          compact
          tone="gold"
          message="Tous les vrais sujets Bac SVT et Sciences Naturelles. Clique pour ouvrir le PDF, télécharge pour garder."
        />

        <section className="card p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow">بَنْكُ الْأَمْثِلَةِ</p>
              <h2 className="font-naskh mt-2 text-2xl font-bold">Sujets d'examen Bac</h2>
              <p className="mt-1 text-sm text-mute">
                {sujetsFiltres.length} sujet{sujetsFiltres.length > 1 ? 's' : ''} disponible{sujetsFiltres.length > 1 ? 's' : ''} — PDF officiels, sans modification
              </p>
            </div>
            <select
              value={serieFiltre}
              onChange={e => setSerieFiltre(e.target.value as typeof serieFiltre)}
              className="rounded-xl border border-line bg-paper px-4 py-2 text-sm font-bold"
            >
              <option value="toutes">Toutes les séries</option>
              <option value="SVT">SVT</option>
              <option value="Sciences Naturelles">Sciences Naturelles</option>
            </select>
          </div>

          {anneesDisponibles.length === 0 ? (
            <p className="text-center text-mute py-12">Aucun sujet pour ce filtre.</p>
          ) : (
            <div className="space-y-6">
              {anneesDisponibles.map(annee => {
                const sujets = sujetsParAnnee.get(annee) ?? [];
                return (
                  <details key={annee} className="group">
                    <summary className="flex items-center gap-4 rounded-2xl border border-line bg-paper px-5 py-4 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <span className="shrink-0 grid h-12 w-12 place-items-center rounded-xl bg-forest-soft/50 text-forest-deep font-bold text-xl">
                        {annee}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold">{sujets.length} sujet{sujets.length > 1 ? 's' : ''}</p>
                        <p className="text-sm text-mute">
                          {sujets.map(s => getSessionLabel(s.session)).join(' · ')}
                        </p>
                      </div>
                      <span className="text-mute">▼</span>
                    </summary>
                    <div className="mt-3 space-y-2 pl-16 border-r border-line">
                      {sujets.map(sujet => (
                        <article key={sujet.id} className="card p-4 relative">
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 mt-1 grid h-8 w-8 place-items-center rounded-lg bg-sage/50 text-forest font-bold text-xs">
                              <IcoDocument />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{sujet.titre}</p>
                              <p className="text-xs text-mute mt-0.5">
                                Session : {getSessionLabel(sujet.session)} · {formaterTaille(sujet.taille)} · Source : {sujet.source}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => ouvrirPDF(sujet.fichier)}
                                className="btn btn-primary text-xs"
                                title="Ouvrir dans un nouvel onglet"
                              >
                                <span className="flex items-center gap-1">
                                  <span className="h-3.5 w-3.5 shrink-0">
                                    <IcoDocument />
                                  </span>
                                  Ouvrir
                                </span>
                              </button>
                              <button
                                onClick={() => telechargerPDF(sujet.fichier, sujet.titre)}
                                className="btn btn-ghost text-xs"
                                title="Télécharger"
                              >
                                <span className="flex items-center gap-1">
                                  <span className="h-3.5 w-3.5 shrink-0">
                                    <IcoDownload />
                                  </span>
                                  Télécharger
                                </span>
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}