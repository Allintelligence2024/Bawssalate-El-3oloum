// اختبارات شاملة للخطة النهائية + خطة الـ 30 يومًا الذكية + شجرة تحليل الأداء:
// - إصلاحات الفورينسيك (المزامنة، الخصوصية، التخزين، صوتيات SW، CSP/sandbox، التوقيت)
// - خطة 30 يومًا في العلوم مبنية على بيانات التلميذ (هشاشة، استرجاع SM-2، امتحانات، تموضع)
// - شجرة تحليل الأداء (3 مجالات ← 11 وحدة، كفاءات، أولويات)
// - سبرينت ٣ دقائق (خلط غير منحاز بـ Math.imul) + درع الراحة الأسبوعي + وضع 4G

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { etatVierge } from '../../types';
import { nettoyerBrutSecours } from '../../components/ErrorBoundary';
import { normaliserBaseAudio } from '../audioUrl';
import { appliquerEvenementBoussole } from '../boussoleAdapter';
import { genererPlan30JoursScience } from '../plan30Jours';
import { construireArbreAnalyse } from '../arbreAnalyse';
import { composerSprint3Min, melangerSprint } from '../sprint3Min';
import {
  activerJourReposEtat,
  bouclierReposDisponibleSemaine,
  joursConsecutifsAvecBouclier,
} from '../xp';
import { CLE_DATA_SAVER, ecrireDataSaver4G, lireDataSaver4G } from '../dataSaver';
import { chargerEtat, CLE_ETAT, sauvegarderEtat, viderStockage } from '../storage';
import { memoriserValeur, reinitialiserEtatPerime } from '../coherenceStockage';
import { effacerAlerteStockage } from '../echecsStockage';
import { reinitialiserGenerationsMemoire } from '../sync';
import type { StatsReponses } from '../stats';

let store: Record<string, string>;

beforeEach(() => {
  store = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
  reinitialiserEtatPerime();
  memoriserValeur(CLE_ETAT, null);
  memoriserValeur('kunz_stats_v1', null);
  effacerAlerteStockage();
  reinitialiserGenerationsMemoire();
});

afterEach(() => {
  (globalThis as any).localStorage = undefined;
});

describe('الموجة 1 — إصلاحات الأمان والخصوصية والتخزين', () => {
  it('nettoyerBrutSecours يحذف compte و motDePasse و jeton و consentementSync من ملف الطوارئ', () => {
    const brut = JSON.stringify({
      version: 3,
      nom: 'أمين',
      compte: { email: 'a@b.dz', motDePasse: 'secret-hash', jeton: 'tok-123', wilaya: '16', daira: 'الجزائر', creeLe: '2026-01-01' },
      consentementSync: true,
      consentementSyncDecideLe: '2026-01-01',
      progression: { lecon_transcription: { statut: 'terminee', phases: [1, 2, 3, 4, 5, 6], minutes: 20, repetitions: 1, intervalle: 1, facilite: 2.5 } },
    });
    const nettoyeBrut = nettoyerBrutSecours(brut);
    expect(nettoyeBrut).not.toBeNull();
    const nettoye = JSON.parse(nettoyeBrut!);
    expect(nettoye.etat.compte).toBeUndefined();
    expect(nettoye.etat.consentementSync).toBeUndefined();
    expect(nettoye.etat.consentementSyncDecideLe).toBeUndefined();
    expect(nettoye.etat.nom).toBe('أمين');
    expect(nettoye.etat.progression.lecon_transcription.statut).toBe('terminee');
  });

  it('normaliserBaseAudio يقبل المسارات النسبية و https فقط ويرفض javascript و http و //', () => {
    expect(normaliserBaseAudio('/audio/')).toBe('/audio/');
    expect(normaliserBaseAudio('https://cdn.bousala.dz/audio')).toBe('https://cdn.bousala.dz/audio/');
    expect(normaliserBaseAudio('javascript:alert(1)')).toBeNull();
    expect(normaliserBaseAudio('http://insecure.example/audio')).toBeNull();
    expect(normaliserBaseAudio('//evil.example/audio')).toBeNull();
    expect(normaliserBaseAudio('data:text/html,hi')).toBeNull();
  });

  it('chargerEtat يرفض إصدارًا مستقبليًا (version > VERSION_ETAT) بدل تخمينه', () => {
    store[CLE_ETAT] = JSON.stringify({ version: 99, progression: {} });
    const etat = chargerEtat();
    expect(etat.version).toBe(3);
    expect(Object.keys(etat.progression)).toHaveLength(0);
  });

  it('viderStockage يمسح التليمترية وهوية المزامنة وأجيال المزامنة وإعداد 4G', () => {
    sauvegarderEtat(etatVierge());
    store['kunz_telemetrie_v1'] = '{"a":1}';
    store['kunz-identite-sync-v1'] = 'id-1';
    store['kunz_sync_generations_v1'] = '{"a@b.dz":4}';
    store[CLE_DATA_SAVER] = '1';
    expect(viderStockage(null)).toBe(true);
    expect(store['kunz_telemetrie_v1']).toBeUndefined();
    expect(store['kunz-identite-sync-v1']).toBeUndefined();
    expect(store['kunz_sync_generations_v1']).toBeUndefined();
    expect(store[CLE_DATA_SAVER]).toBeUndefined();
  });

  it('appliquerEvenementBoussole يوحّد مفتاح التكرار بصيغة boussole:<attemptId> ويقبل المفتاح القديم', () => {
    const base = etatVierge();
    const evt = {
      type: 'learning.attempt.completed' as const,
      schemaVersion: 1 as const,
      source: 'boussole' as const,
      attemptId: 'att-42-123456',
      timestamp: '2026-11-28T10:00:00.000Z',
      mode: 'atelier' as const,
      exerciseId: 'ex1',
      unitId: 'u1' as const,
      verbe: 'حلّل',
      titre: 'تمرين 1',
      reussi: true,
    };
    const e1 = appliquerEvenementBoussole(base, evt);
    expect(e1.boussoleEventsSeen).toContain('boussole:att-42-123456');
    const e2 = appliquerEvenementBoussole(e1, evt);
    expect(e2).toBe(e1);
    const legacy = { ...base, boussoleEventsSeen: ['att-42-123456'] };
    expect(appliquerEvenementBoussole(legacy, evt)).toBe(legacy);
  });

  it('ملفات التكوين (vercel.json, sw.js, AndroidManifest.xml, manifest.webmanifest) مطابقة لمتطلبات الأمان', () => {
    const vercel = readFileSync('vercel.json', 'utf8');
    expect(vercel).not.toMatch(/connect-src[^"]+https:\s*;/);
    const sw = readFileSync('public/sw.js', 'utf8');
    expect(sw).toContain('CONFIG_DATA_SAVER');
    expect(sw).toContain('status: 416');
    const manifestAndroid = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
    expect(manifestAndroid).toContain('android:allowBackup="false"');
    const webmanifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(webmanifest.id).toBe('/');
    expect(webmanifest.icons.some((i: { type: string }) => i.type === 'image/png')).toBe(true);
  });
});

describe('خطة الـ 30 يومًا الذكية في العلوم + شجرة تحليل الأداء', () => {
  it('تضع الدروس الهشّة في مقدّمة اليوم الأول تلقائيًّا وتحترم أسبوع الدراسة الجزائري', () => {
    const etat = {
      ...etatVierge(),
      progression: {
        lecon_transcription: {
          statut: 'terminee' as const,
          phases: [1, 2, 3, 4, 5, 6],
          minutes: 25,
          repetitions: 1,
          intervalle: 1,
          facilite: 2.3,
          fragile: true,
        },
      },
    };
    const plan = genererPlan30JoursScience(etat, '2026-05-10'); // الأحد
    expect(plan.jours).toHaveLength(30);
    expect(plan.aujourdhui.estAujourdhui).toBe(true);
    expect(plan.aujourdhui.lessonId).toBe('lecon_transcription');
    expect(plan.aujourdhui.actionType).toBe('revision');
    expect(plan.aujourdhui.etapes.length).toBeGreaterThanOrEqual(2);
    expect(plan.jours[5].jourSemaineAr).toBe('الجمعة');
    expect(plan.jours[5].actionType).toBe('repos_leger');
    expect(plan.jours[6].jourSemaineAr).toBe('السبت');
    expect(['examen', 'fakh']).toContain(plan.jours[6].actionType);
  });

  it('تبني شجرة تحليل شاملة بـ 3 مجالات و 11 وحدة وتحدّد الأولوية من بيانات التلميذ', () => {
    const etat = {
      ...etatVierge(),
      nom: 'سارة',
      progression: {
        lecon_transcription: {
          statut: 'terminee' as const,
          phases: [1, 2, 3, 4, 5, 6],
          minutes: 20,
          repetitions: 1,
          intervalle: 1,
          facilite: 2.5,
          fragile: true,
        },
      },
    };
    const stats: StatsReponses = {
      justes: 12,
      fausses: 3,
      parSource: {
        phase: { justes: 6, fausses: 1 },
        revision: { justes: 3, fausses: 1 },
        jalon: { justes: 0, fausses: 0 },
        atelier: { justes: 0, fausses: 0 },
        exercice: { justes: 3, fausses: 1 },
      },
      parJour: {},
    };
    const arbre = construireArbreAnalyse(etat, stats, undefined, '2026-05-10');
    expect(arbre.racine.nom).toBe('سارة');
    expect(arbre.domaines).toHaveLength(3);
    const totalUnites = arbre.domaines.reduce((s, d) => s + d.unites.length, 0);
    expect(totalUnites).toBe(11);
    expect(arbre.domaines[0].statut).toBe('fragile');
    expect(arbre.priorites.fragilesIds).toContain('lecon_transcription');
    expect(arbre.priorites.actionRecommandee.type).toBe('revision');
    expect(arbre.competences.reponsesJustes).toBe(12);
    expect(arbre.competences.reponsesTotal).toBe(15);
  });
});

describe('الموجة 3 — سبرينت ٣ دقائق ودرع الراحة الأسبوعي ووضع 4G', () => {
  it('composerSprint3Min يركّب 6 أسئلة صالحة مع خلط غير منحاز لـ bonneReponse', () => {
    const etat = etatVierge();
    const items = composerSprint3Min(etat, '2026-11-28');
    expect(items).toHaveLength(6);
    for (const item of items) {
      expect(item.options).toContain(item.bonneReponse);
      expect(item.options.length).toBeGreaterThanOrEqual(2);
    }
    const positions = new Set<number>();
    for (let i = 0; i < 40; i++) {
      const m = melangerSprint(['A', 'B', 'C', 'D'], `graine-production-longue-${i}-2026-11-28`);
      positions.add(m.indexOf('A'));
    }
    expect(positions.size).toBe(4);
  });

  it('درع الراحة الأسبوعي يحفظ السلسلة عبر فجوة يوم واحد ويلتزم بسقف يوم واحد في الأسبوع', () => {
    const journal = ['2026-11-22', '2026-11-23', '2026-11-25', '2026-11-26'];
    expect(joursConsecutifsAvecBouclier(journal, [], '2026-11-26')).toBe(2);
    expect(joursConsecutifsAvecBouclier(journal, ['2026-11-24'], '2026-11-26')).toBe(4);
    expect(bouclierReposDisponibleSemaine(['2026-11-24'], '2026-11-26')).toBe(false);
    expect(bouclierReposDisponibleSemaine(['2026-11-24'], '2026-11-29')).toBe(true);

    const etat1 = activerJourReposEtat(etatVierge(), '2026-11-24');
    expect(etat1.rythmeBienveillant?.joursRepos).toEqual(['2026-11-24']);
    const etat2 = activerJourReposEtat(etat1, '2026-11-25');
    expect(etat2.rythmeBienveillant?.joursRepos).toEqual(['2026-11-24']);
  });

  it('ecrireDataSaver4G يحفظ ويلغي التفضيل في localStorage', () => {
    expect(lireDataSaver4G()).toBe(false);
    expect(ecrireDataSaver4G(true)).toBe(true);
    expect(store[CLE_DATA_SAVER]).toBe('1');
    expect(lireDataSaver4G()).toBe(true);
    expect(ecrireDataSaver4G(false)).toBe(true);
    expect(lireDataSaver4G()).toBe(false);
  });
});
