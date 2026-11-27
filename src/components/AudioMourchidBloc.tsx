// المرحلة 3 — غلاف كسول يعرض كبسولة أو كبسولات «صوت المُرشد» دون إدخال السجلّ في حزمة البدء.

import { useEffect, useState } from 'react';
import type { PisteAudioMourchid } from '../data/audioMourchid';
import { chargerAudioMourchid, lireAudioMourchidCache } from '../utils/audioMourchidChargeur';
import LecteurAudioMourchid from './LecteurAudioMourchid';

interface Props {
  /** عرض كبسولة الوحدة الموافقة (u1..u11) */
  uniteId?: string;
  /** عرض كبسولات المنهجية الموافقة لفرع في المُرشد */
  brancheMourchid?: string;
  /** عرض كل كبسولات المنهجية الثلاث (شاشة المُرشد الرئيسية) */
  modeMethodo?: boolean;
  compact?: boolean;
  baseUrl?: string;
}

function filtrer(
  pistes: PisteAudioMourchid[],
  props: Pick<Props, 'uniteId' | 'brancheMourchid' | 'modeMethodo'>,
): PisteAudioMourchid[] {
  if (props.uniteId) {
    return pistes.filter((p) => p.unites.includes(props.uniteId!));
  }
  if (props.brancheMourchid) {
    return pistes.filter((p) => Boolean(p.branchesMourchid?.includes(props.brancheMourchid!)));
  }
  if (props.modeMethodo) {
    return pistes.filter((p) => p.categorie === 'methodo');
  }
  return [];
}

export default function AudioMourchidBloc({
  uniteId,
  brancheMourchid,
  modeMethodo,
  compact = false,
  baseUrl,
}: Props) {
  const [pistes, setPistes] = useState<PisteAudioMourchid[] | null>(() => lireAudioMourchidCache());

  useEffect(() => {
    if (pistes) return;
    let actif = true;
    void chargerAudioMourchid()
      .then((liste) => {
        if (actif) setPistes(liste);
      })
      .catch(() => {
        /* دون اتصال وقبل التنزيل: نُخفي الكتلة بهدوء دون كسر الشاشة */
      });
    return () => {
      actif = false;
    };
  }, [pistes]);

  if (!pistes) return null;
  const visibles = filtrer(pistes, { uniteId, brancheMourchid, modeMethodo });
  if (visibles.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibles.map((piste) => (
        <LecteurAudioMourchid key={piste.id} piste={piste} compact={compact} baseUrl={baseUrl} />
      ))}
    </div>
  );
}
