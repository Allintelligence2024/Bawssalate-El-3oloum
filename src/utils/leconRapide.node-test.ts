import test from 'node:test';
import assert from 'node:assert/strict';
import { UNITES } from '../data/programme';
import { LESSON_GOLD_SUMMARIES } from '../data/lessonGoldSummaries';
import { QCM_LECONS } from '../data/qcmLecons';
import {
  construireCarteBac,
  construireCartesExercice,
  construireResumeCourtAr,
  etapeInitialeDepuisProgression,
  phasesPourEtape,
} from './leconRapide';

test('construireCartesExercice produces 3 valid cards for every single program lesson', () => {
  const allIds = UNITES.flatMap((u) => [...(u.prerequis ?? []), ...u.lessonIds]);
  assert.ok(allIds.length >= 55);

  for (const id of allIds) {
    const lecon = LESSON_GOLD_SUMMARIES[id];
    assert.ok(lecon, `missing summary for ${id}`);
    const cartes = construireCartesExercice(id, lecon, QCM_LECONS[id]);
    assert.equal(cartes.length, 3, `expected 3 cards for ${id}, got ${cartes.length}`);
    for (const c of cartes) {
      assert.ok(c.question.trim().length > 5, `empty question for ${id}`);
      assert.ok(c.options.length >= 2, `too few options for ${id}:${c.id}`);
      assert.ok(c.options.includes(c.bonneReponse), `correct option missing in ${id}:${c.id}`);
      assert.ok(c.explication.trim().length > 3, `empty explanation for ${id}:${c.id}`);
    }
  }
});

test('construireCarteBac returns a valid BAC phrasing check for every lesson', () => {
  const allIds = UNITES.flatMap((u) => [...(u.prerequis ?? []), ...u.lessonIds]);
  for (const id of allIds) {
    const lecon = LESSON_GOLD_SUMMARIES[id];
    const carte = construireCarteBac(id, lecon, QCM_LECONS[id]);
    assert.ok(carte.options.includes(carte.bonneReponse), `BAC card missing answer for ${id}`);
    assert.ok(carte.options.length >= 2);
  }
});

test('construireResumeCourtAr creates a concise Arabic summary for lessons without MP3', () => {
  const lecon = LESSON_GOLD_SUMMARIES['prerequis2AS_genetique'];
  assert.ok(lecon);
  const texte = construireResumeCourtAr(lecon, 'مكتسبات السنة الثانية');
  assert.ok(texte.includes('ملخّص درس'));
  assert.ok(texte.includes('الفخّ الشائع'));
});

test('phase mapping preserves 6-phase state compatibility cleanly', () => {
  assert.deepEqual(phasesPourEtape(0), [1, 2]);
  assert.deepEqual(phasesPourEtape(1), [1, 2, 3, 4]);
  assert.deepEqual(phasesPourEtape(2), [1, 2, 3, 4, 5, 6]);
  assert.equal(etapeInitialeDepuisProgression(undefined), 0);
  assert.equal(
    etapeInitialeDepuisProgression({
      statut: 'en_cours',
      phases: [1, 2],
      minutes: 3,
      repetitions: 0,
      intervalle: 0,
      facilite: 2.5,
    }),
    1
  );
  assert.equal(
    etapeInitialeDepuisProgression({
      statut: 'en_cours',
      phases: [1, 2, 3, 4],
      minutes: 6,
      repetitions: 0,
      intervalle: 0,
      facilite: 2.5,
    }),
    2
  );
});
