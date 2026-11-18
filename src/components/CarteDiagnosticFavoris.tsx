// «أنا» — بيان التموضع (P2.1) والمفضّلة (P3.3). كلمات لا أرقام، ولا شيء يفتح الطريق.

import type { Etat } from '../types';
import { UNITE_PAR_ID, titreLecon, uniteDeLecon } from '../data/programme';
import { bilanDiagnostic } from '../utils/diagnostic';
import { nb } from '../utils/dates';

interface Props {
  etat: Etat;
  onOuvrirDiagnostic: () => void;
  onOuvrirLecon: (lessonId: string) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onBasculerFavori: (lessonId: string) => void;
}

export default function CarteDiagnosticFavoris({
  etat,
  onOuvrirDiagnostic,
  onOuvrirLecon,
  onDemarrerRevision,
  onBasculerFavori,
}: Props) {
  const d = etat.diagnostic;
  const b = d ? bilanDiagnostic(d) : null;
  const favoris = etat.favoris ?? [];
  const noms = (ids: string[]) => ids.map((id) => `الوحدة ${nb(UNITE_PAR_ID[id].numero)}`).join('، ');

  return (
    <>
      <section className="card mt-5 p-5">
        <p className="eyebrow">اختبار التموضع</p>
        {b ? (
          <>
            <p className="mt-2 text-xs text-mute">آخر اختبار: {new Date(d!.date).toLocaleDateString('ar-DZ')}</p>
            <dl className="mt-3 space-y-2 text-sm">
              {b.fortes.length > 0 && (
                <div>
                  <dt className="text-xs font-bold text-forest">متين عندك</dt>
                  <dd className="text-ink-soft">{noms(b.fortes)}</dd>
                </div>
              )}
              {b.moyennes.length > 0 && (
                <div>
                  <dt className="text-xs font-bold text-ink">متوسّط</dt>
                  <dd className="text-ink-soft">{noms(b.moyennes)}</dd>
                </div>
              )}
              {b.fragiles.length > 0 && (
                <div>
                  <dt className="text-xs font-bold text-forest-deep">يستحقّ تثبيتًا حين يأتي دوره</dt>
                  <dd className="text-ink-soft">{noms(b.fragiles)}</dd>
                </div>
              )}
            </dl>
            <button type="button" onClick={onOuvrirDiagnostic} className="btn btn-ghost mt-4 w-full text-sm">
              عرض البيان أو إعادة الاختبار
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs leading-relaxed text-mute">
              22 سؤالًا في نحو 12 دقيقة لترى بالكلمات ما هو متين عندك وما يستحقّ تثبيتًا. لا علامة، ولا يغيّر طريقك.
            </p>
            <button type="button" onClick={onOuvrirDiagnostic} className="btn btn-primary mt-4 w-full text-sm">
              ابدأ اختبار التموضع
            </button>
          </>
        )}
      </section>

      <section className="card mt-5 p-5">
        <p className="eyebrow">المفضّلة</p>
        {favoris.length === 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-mute">
            اضغط ☆ في أعلى أي درس لتحفظه هنا، ثم راجع المفضّلة كلّها في جلسة واحدة.
          </p>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-line">
              {favoris.map((id) => {
                const u = uniteDeLecon(id);
                return (
                  <li key={id} className="flex items-center gap-2 py-2">
                    <button type="button" onClick={() => onOuvrirLecon(id)} className="min-w-0 flex-1 text-right">
                      <span className="block truncate text-sm font-bold">{titreLecon(id)}</span>
                      {u && <span className="block text-[11px] text-mute">الوحدة {nb(u.numero)} · {u.titre}</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => onBasculerFavori(id)}
                      aria-label="إزالة من المفضّلة"
                      className="shrink-0 rounded-lg px-2 py-1 text-lg text-forest-deep hover:bg-sage-soft"
                    >
                      ★
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => onDemarrerRevision(favoris.filter((id) => etat.progression[id]?.statut === 'terminee'))}
              disabled={!favoris.some((id) => etat.progression[id]?.statut === 'terminee')}
              className="btn btn-primary mt-4 w-full text-sm disabled:opacity-50"
            >
              راجع المفضّلة المُنجزة
            </button>
            <p className="mt-2 text-[11px] text-mute">المراجعة تشمل الدروس التي أنهيت بروتوكولها فقط — الباقي يُقرأ.</p>
          </>
        )}
      </section>
    </>
  );
}
