// وثائق الموضوع 2023-1: تحقّق من أنّ كلّ رسم أصلي يقابل معطى في التصحيح النموذجي.
// الغرض: أن لا يظهر رسم بلا سند، ولا يبقى في التصحيح قيمة بلا رسم.
import { describe, it, expect } from 'vitest';
import { FIGURES_SUJETS, figuresDe } from '../../data/figuresSujets';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';
import { corrigeDe } from '../../data/sujetsCorriges';

const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;

describe('وثائق الموضوع 2023-1 (رسوم أصلية)', () => {
  it('الموضوع معرّف، وله وثائق', () => {
    expect(sujet).toBeDefined();
    expect(sujet.exercices).toHaveLength(3);
    expect(figuresDe('2023-1').length).toBeGreaterThan(0);
  });

  it('كلّ موضوع بلا وثائق يعيد قائمة فارغة، ولا ينفجر', () => {
    expect(figuresDe('1999-1')).toEqual([]);
    expect(figuresDe('2023-2')).toEqual([]);
  });

  it('المفاتيح فريدة ومطابقة لنمط معروف', () => {
    for (const [sujetId, figures] of Object.entries(FIGURES_SUJETS)) {
      const cles = figures.map((f) => f.cle);
      expect(new Set(cles).size, `${sujetId}: مفتاح مكرّر`).toBe(cles.length);
      for (const c of cles) expect(c).toMatch(/^\d{4}-\d-e\d-[a-z0-9]+$/);
    }
  });

  it('كلّ رسم كامل: عنوان، تحرير، ومحاور متّسقة مع النقاط', () => {
    for (const f of figuresDe('2023-1')) {
      expect(f.titre.length, f.cle).toBeGreaterThan(8);
      expect(f.legende.length, f.cle).toBeGreaterThan(40);
      if (f.type === 'schema') continue;
      expect(f.axeX && f.axeY, `${f.cle}: محاور ناقصة`).toBeTruthy();
      expect(f.series!.length, `${f.cle}: بلا سلاسل`).toBeGreaterThan(0);
      for (const s of f.series!) {
        expect(s.points.length, `${f.cle}/${s.nom}`).toBeGreaterThan(1);
        for (const [x, y] of s.points) {
          // نقطة خارج المحور = رسم يكذب على التلميذ
          expect(x, `${f.cle}/${s.nom}: x=${x} خارج المحور`).toBeGreaterThanOrEqual(f.axeX!.min);
          expect(x, `${f.cle}/${s.nom}: x=${x} خارج المحور`).toBeLessThanOrEqual(f.axeX!.max);
          expect(y, `${f.cle}/${s.nom}: y=${y} خارج المحور`).toBeGreaterThanOrEqual(f.axeY!.min);
          expect(y, `${f.cle}/${s.nom}: y=${y} خارج المحور`).toBeLessThanOrEqual(f.axeY!.max);
        }
        // ترتيب تصاعدي على x: بدونه الخطّ يرجع إلى الوراء
        for (let i = 1; i < s.points.length; i++) {
          expect(s.points[i][0], `${f.cle}/${s.nom}: x غير تصاعدي`).toBeGreaterThan(s.points[i - 1][0]);
        }
      }
    }
  });

  it('القيم المفتاحية التي يبني عليها التصحيح موجودة في الرسم', () => {
    const de = (cle: string) => figuresDe('2023-1').find((f) => f.cle === cle)!;
    const valeur = (cle: string, serie: string, x: number) =>
      de(cle).series!.find((s) => s.nom === serie)!.points.find((p) => p[0] === x)![1];

    // التمرين 2: اليوم 3 متساوٍ (~7 %)، ودون علاج يبلغ ~77 % في اليوم 7
    expect(valeur('2023-1-e2-doc1a', 'دون علاج', 3)).toBe(7);
    expect(valeur('2023-1-e2-doc1a', 'مع ML901', 3)).toBe(7);
    expect(valeur('2023-1-e2-doc1a', 'دون علاج', 7)).toBe(77);

    // الاستنساخ ثابت 100 %؛ الترجمة تنعدم عند التركيز 10
    expect(de('2023-1-e2-doc1b').series!.find((s) => s.nom === 'الاستنساخ')!.points.every((p) => p[1] === 100)).toBe(true);
    expect(valeur('2023-1-e2-doc1b', 'الترجمة', 10)).toBe(0);

    // الوثيقة 2: الإنسان 100 % ثابت، الطفيلي ينعدم
    expect(de('2023-1-e2-doc2').series!.find((s) => s.nom === 'عند الإنسان')!.points.every((p) => p[1] === 100)).toBe(true);
    expect(valeur('2023-1-e2-doc2', 'عند الطفيلي', 10)).toBe(0);

    // التمرين 3: الأروماتاز يتوقّف عند 50؛ حجم الورم 2000 مقابل 700 في اليوم 27
    expect(valeur('2023-1-e3-doc3a', 'نشاط الأروماتاز', 50)).toBe(0);
    expect(valeur('2023-1-e3-doc3b', 'دون الكيرستين', 27)).toBe(2000);
    expect(valeur('2023-1-e3-doc3b', 'مع الكيرستين', 27)).toBe(700);
    // والفرق واضح بما يكفي ليُقرأ بالعين
    expect(valeur('2023-1-e3-doc3b', 'دون الكيرستين', 27) / valeur('2023-1-e3-doc3b', 'مع الكيرستين', 27)).toBeGreaterThan(2);
  });

  it('كلّ تعليمة تُحيل إلى وثيقة لها رسم مقابل', () => {
    const cles = new Set(figuresDe('2023-1').map((f) => f.cle));
    const exercicesAvecFigures = new Set(figuresDe('2023-1').map((f) => Number(f.cle.split('-')[2].slice(1))));
    for (const e of sujet.exercices) {
      const aDesConsignesSurDocument = e.parties.some((p) => p.consignes.some((c) => c.surDocument));
      if (aDesConsignesSurDocument) {
        expect(exercicesAvecFigures.has(e.numero), `التمرين ${e.numero}: تعليمات على وثيقة بلا رسم`).toBe(true);
      }
      // ولا يوجد رسم لتمرين غير موجود
      expect(e.numero).toBeLessThanOrEqual(3);
    }
    expect(cles.size).toBe(figuresDe('2023-1').length);
  });

  it('التصحيح لهذا الموضوع موجود ويغطّي كلّ تعليمة', () => {
    const corrige = corrigeDe('2023-1');
    expect(corrige).toBeDefined();
    for (const e of sujet.exercices) {
      const ec = corrige!.exercices.find((x) => x.numero === e.numero)!;
      expect(ec).toBeDefined();
      e.parties.forEach((p, i) => {
        const reponses = ec.parties[i].reponses.map((r) => r.consigne);
        // كلّ تعليمة لها عنصر إجابة، وإلّا فالتلميذ يُسأل بلا تصحيح
        p.consignes.forEach((_, j) => {
          expect(reponses, `تمرين ${e.numero} جزء ${i} تعليمة ${j}`).toContain(j);
        });
      });
    }
  });
});
