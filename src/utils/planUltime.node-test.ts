// Pure node:test fast-feedback suite for data-driven 30-day plan, analysis tree, sprint & security
// Run with: npx --yes tsx --test src/utils/planUltime.node-test.ts

import test from 'node:test';
import assert from 'node:assert/strict';
import { etatVierge } from '../types';
import { normaliserBaseAudio } from './audioUrl';
import { genererPlan30JoursScience } from './plan30Jours';
import { construireArbreAnalyse } from './arbreAnalyse';
import { composerSprint3Min, melangerSprint } from './sprint3Min';
import type { StatsReponses } from './stats';
import {
  activerJourReposEtat,
  bouclierReposDisponibleSemaine,
  joursConsecutifsAvecBouclier,
} from './xp';

const statsBase: StatsReponses = {
  justes: 9,
  fausses: 2,
  parSource: {
    phase: { justes: 5, fausses: 1 },
    revision: { justes: 2, fausses: 1 },
    jalon: { justes: 0, fausses: 0 },
    atelier: { justes: 0, fausses: 0 },
    exercice: { justes: 2, fausses: 0 },
  },
  parJour: {},
};

test('genererPlan30JoursScience prioritizes fragile student lessons today and respects Algerian week', () => {
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
  const plan = genererPlan30JoursScience(etat, '2026-05-10'); // Sunday
  assert.equal(plan.jours.length, 30);
  assert.equal(plan.aujourdhui.estAujourdhui, true);
  assert.equal(plan.aujourdhui.lessonId, 'lecon_transcription');
  assert.equal(plan.aujourdhui.actionType, 'revision');
  assert.equal(plan.jours[5].jourSemaineAr, 'الجمعة');
  assert.equal(plan.jours[5].actionType, 'repos_leger');
  assert.equal(plan.jours[6].jourSemaineAr, 'السبت');
  assert.ok(plan.jours[6].actionType === 'examen' || plan.jours[6].actionType === 'fakh');
});

test('construireArbreAnalyse builds 3 domains -> 11 units and detects priority action', () => {
  const etat = {
    ...etatVierge(),
    nom: 'أمين',
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
  const arbre = construireArbreAnalyse(etat, statsBase, undefined, '2026-05-10');
  assert.equal(arbre.racine.nom, 'أمين');
  assert.equal(arbre.domaines.length, 3);
  const totalUnites = arbre.domaines.reduce((sum, d) => sum + d.unites.length, 0);
  assert.equal(totalUnites, 11);
  assert.equal(arbre.domaines[0].statut, 'fragile');
  assert.equal(arbre.priorites.actionRecommandee.type, 'revision');
  assert.equal(arbre.competences.reponsesTotal, 11);
});

test('composerSprint3Min returns 6 valid items and Math.imul shuffle is unbiased', () => {
  const items = composerSprint3Min(etatVierge(), '2026-11-28');
  assert.equal(items.length, 6);
  for (const item of items) {
    assert.ok(item.options.includes(item.bonneReponse));
  }
  const positions = new Set<number>();
  for (let i = 0; i < 40; i++) {
    const shuffled = melangerSprint(['A', 'B', 'C', 'D'], `seed-long-production-${i}-2026`);
    positions.add(shuffled.indexOf('A'));
  }
  assert.equal(positions.size, 4);
});

test('weekly protected rest-day shield preserves streak across 1-day gap with 1/week cap', () => {
  const journal = ['2026-11-22', '2026-11-23', '2026-11-25', '2026-11-26'];
  assert.equal(joursConsecutifsAvecBouclier(journal, [], '2026-11-26'), 2);
  assert.equal(joursConsecutifsAvecBouclier(journal, ['2026-11-24'], '2026-11-26'), 4);
  assert.equal(bouclierReposDisponibleSemaine(['2026-11-24'], '2026-11-26'), false);
  assert.equal(bouclierReposDisponibleSemaine(['2026-11-24'], '2026-11-29'), true);

  const e1 = activerJourReposEtat(etatVierge(), '2026-11-24');
  const e2 = activerJourReposEtat(e1, '2026-11-25');
  assert.deepEqual(e2.rythmeBienveillant?.joursRepos, ['2026-11-24']);
});

test('normaliserBaseAudio blocks unsafe protocols and keeps https/relative paths', () => {
  assert.equal(normaliserBaseAudio('/audio/'), '/audio/');
  assert.equal(normaliserBaseAudio('https://cdn.example.dz/a'), 'https://cdn.example.dz/a/');
  assert.equal(normaliserBaseAudio('javascript:alert(1)'), null);
  assert.equal(normaliserBaseAudio('http://plain.example/a'), null);
  assert.equal(normaliserBaseAudio('//evil.example/a'), null);
});
