// Jeux de briques — unité 3 (النشاط الإنزيمي), Phase 4.
//
// Une seule situation, la seconde du programme (`u3b`, الريبونوكلياز والتمسّخ العكوس) :
// elle porte une comparaison explicite (avant/après l'urée et le β-mercaptoéthanol) et une
// conclusion sur la relation structure ↔ activité. Le découpage est fait par
// `jeuDepuisSituation` : aucune phrase n'est écrite ici.
//
// Statut : `a_valider_enseignant`. L'élève ne le voit **que** par la porte d'aperçu de
// l'écran 1-2-3 (voir `utils/briques.ts`), avec la mention « قيد المراجعة ».

import { situationsDeUnite } from '../syntheses';
import { jeuDepuisSituation } from './gabarit';
import type { JeuBriques } from './types';

// `situationDeUnite` ne distingue pas les deux situations d'une même unité (même `uniteId`) :
// on cible donc l'identifiant exact `u3b`.
const situation = situationsDeUnite('u3').find((s) => s.id === 'u3b') ?? situationsDeUnite('u3')[0];

export const JEUX_UNITE3: JeuBriques[] = situation
  ? [
      jeuDepuisSituation(situation, {
        id: 'jb:u3:e1',
        verbe: 'بيِّن',
        attendu:
          'ربط البنية الفراغية للموقع الفعّال بالنشاط: الروابط التي تكسرها اليوريا والـβ-ميركابتوإيثانول، ثمّ دور الجذور 12 و41 و119 في التثبيت والتحفيز.',
      }),
    ]
  : [];
