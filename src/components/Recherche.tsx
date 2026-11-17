// البحث (P3.3) — شاشة كاملة، محلّية، تفتح الدرس للقراءة (الملخّص + الكتاب عند الفصل الصحيح).
// القراءة لا تُحتسب حصّة ولا تفتح القفل: البروتوكول يبقى بترتيبه.

import { useMemo, useState } from 'react';
import type { Etat } from '../types';
import { rechercher, type FiltreRecherche } from '../utils/recherche';
import { DOMAINES, UNITE_PAR_ID, UNITES } from '../data/programme';
import { nb } from '../utils/dates';
import { IcoRetour } from './Icones';

interface Props {
  etat: Etat;
  onOuvrirLecon: (lessonId: string) => void;
  onFermer: () => void;
}

export default function Recherche({ etat, onOuvrirLecon, onFermer }: Props) {
  const [q, setQ] = useState('');
  const [filtre, setFiltre] = useState<FiltreRecherche>({});
  const resultats = useMemo(() => rechercher(q, 60, filtre), [q, filtre]);
  const avecFiltre = Boolean(filtre.domaineId || filtre.uniteId);
  const unitesDuFiltre = filtre.domaineId ? UNITES.filter((u) => DOMAINES.find((d) => d.id === filtre.domaineId)?.unites.includes(u.id)) : UNITES;
  const favoris = etat.favoris ?? [];

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={onFermer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft"
            aria-label="رجوع"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <input
            autoFocus
            dir="rtl"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن درس أو مصطلح… مثل: كالفن، ATP، الموهو"
            className="field flex-1"
            aria-label="بحث"
          />
        </div>
      </header>

      <main className="flex-1 px-3 pb-12 pt-3">
        <div className="mx-auto max-w-3xl">
          {/* مرشّحات (P3.3): مجال ثم وحدة — تعمل مع البحث أو وحدها */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltre({})}
              className={`chip text-[11px] font-bold ${!filtre.domaineId ? 'border-forest bg-sage-soft/60 text-forest-deep' : 'border-line text-mute'}`}
            >
              كلّ المجالات
            </button>
            {DOMAINES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setFiltre((f) => (f.domaineId === d.id ? {} : { domaineId: d.id }))}
                className={`chip text-[11px] font-bold ${filtre.domaineId === d.id ? 'border-forest bg-sage-soft/60 text-forest-deep' : 'border-line text-mute'}`}
              >
                {d.titre.replace(/^المجال \S+: /, '')}
              </button>
            ))}
            <select
              value={filtre.uniteId ?? ''}
              onChange={(e) => setFiltre((f) => ({ ...f, uniteId: e.target.value || undefined }))}
              className="field w-auto py-1.5 text-xs"
              aria-label="الوحدة"
            >
              <option value="">كلّ الوحدات</option>
              {unitesDuFiltre.map((u) => (
                <option key={u.id} value={u.id}>
                  الوحدة {nb(u.numero)} · {u.titre}
                </option>
              ))}
            </select>
          </div>

          {q.trim().length < 2 && !avecFiltre ? (
            <p className="mt-6 text-center text-sm text-mute">
              اكتب حرفين على الأقل. البحث يشمل عناوين الدروس والمصطلحات والإشكاليات — دون اتصال.
            </p>
          ) : resultats.length === 0 ? (
            <p className="mt-6 text-center text-sm text-mute">لا نتيجة لـ «{q}». جرّب كلمة أقصر أو مرادفًا.</p>
          ) : (
            <>
              <p className="mt-2 text-[11px] text-mute">{nb(resultats.length)} نتيجة</p>
              <ul className="mt-2 space-y-2">
                {resultats.map(({ entree, contexte }) => {
                  const u = UNITE_PAR_ID[entree.uniteId];
                  const terminee = etat.progression[entree.lessonId]?.statut === 'terminee';
                  return (
                    <li key={entree.lessonId}>
                      <button
                        type="button"
                        onClick={() => onOuvrirLecon(entree.lessonId)}
                        className="card w-full p-4 text-right transition-colors hover:border-forest"
                      >
                        <p className="text-[11px] text-mute">
                          الوحدة {nb(u.numero)} · {u.titre}
                          {terminee ? ' · مُنجز' : ''}
                          {favoris.includes(entree.lessonId) ? ' · ★' : ''}
                        </p>
                        <p className="mt-0.5 text-sm font-bold">{entree.titre}</p>
                        {contexte && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{contexte}</p>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[11px] leading-relaxed text-mute">
                الفتح هنا للقراءة فقط: لا يُحتسب حصّة ولا يغيّر ترتيب طريقك.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
