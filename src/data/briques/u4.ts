// Jeux de briques — unité 4 (الدفاع عن الذات), Phase 4.
//
// La première situation de l'unité (تجربتا النقل: مصل / لمفاويات T) est déjà un exercice de
// comparaison : deux réponses, deux modes d'action. `jeuDepuisSituation` en fait un jeu de
// cinq briques + les deux pièges de l'unité, sans réécrire une phrase.
//
// Statut : `a_valider_enseignant` — visible seulement par la porte d'aperçu.

import { situationDeUnite } from '../syntheses';
import { jeuDepuisSituation } from './gabarit';
import type { JeuBriques } from './types';

const situation = situationDeUnite('u4');

export const JEUX_UNITE4: JeuBriques[] = situation
  ? [
      jeuDepuisSituation(situation, {
        id: 'jb:u4:e1',
        verbe: 'بيِّن',
        attendu:
          'تمييز الخلطية من الخلوية بمعيار العامل الممرّض، ثمّ إظهار التعاون الخلوي: LT4، الإنترلوكين 2، تنشيط LB وLT8.',
      }),
    ]
  : [];
