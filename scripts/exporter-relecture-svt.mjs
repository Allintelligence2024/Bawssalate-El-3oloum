#!/usr/bin/env node
// Exporte les contenus pédagogiques (programme, enquêtes ExamBlanc, statuts de relecture)
// en fichiers Markdown arabes RTL prêts pour la relecture par des enseignants SVT 3AS.
// Usage : node scripts/exporter-relecture-svt.mjs [dossier_sortie]

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sortie = resolve(process.argv[2] ?? join(racine, 'dist-relecture-svt'));

mkdirSync(sortie, { recursive: true });

const VAGUES = [
  { id: 'vague-1', titre: 'الموجة 1 (أولوية قصوى): U1–U3 + مختبر البوصلة + الامتحان التجريبي', unites: ['u1', 'u2', 'u3'] },
  { id: 'vague-2', titre: 'الموجة 2: المناعة والاتصال العصبي (U4–U5)', unites: ['u4', 'u5'] },
  { id: 'vague-3', titre: 'الموجة 3: التحويل الطاقوي والجيولوجيا (U6–U11)', unites: ['u6', 'u7', 'u8', 'u9', 'u10', 'u11'] },
];

function extraireTitresUnites() {
  const prog = readFileSync(join(racine, 'src/data/programme.ts'), 'utf8');
  const unites = new Map();
  const re = /id:\s*'(u\d+)'[\s\S]*?titre:\s*'([^']+)'[\s\S]*?questionAr:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(prog))) {
    unites.set(m[1], { id: m[1], titre: m[2], questionAr: m[3] });
  }
  return unites;
}

const unites = extraireTitresUnites();
const indexLignes = [
  '# ملفّات المراجعة العلمية — علوم الطبيعة والحياة (3 ثانوي علوم تجريبية)',
  '',
  `تاريخ التوليد: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '> هذه الملفّات مُعدّة للأساتذة لمراجعة الصياغة العلمية والمصطلحات الرسمية وأفعال التعليمة، دون الحاجة لقراءة شيفرة TypeScript.',
  '',
];

for (const vague of VAGUES) {
  const lignes = [
    `# ${vague.titre}`,
    '',
    '## جدول المتابعة',
    '',
    '| الوحدة | العنوان | السؤال المحوري | حالة المراجعة | ملاحظات الأستاذ |',
    '|---|---|---|---|---|',
  ];
  for (const uid of vague.unites) {
    const u = unites.get(uid);
    if (!u) continue;
    lignes.push(`| ${uid.toUpperCase()} | ${u.titre} | ${u.questionAr} | ⏳ قيد المراجعة | |`);
  }
  lignes.push(
    '',
    '## نقاط التدقيق المطلوبة من الأستاذ(ة)',
    '1. مطابقة المصطلحات العلمية للمنهاج الرسمي للبكالوريا (شعبة علوم تجريبية).',
    '2. دقّة أفعال التعليمة (استخرج، حلّل، فسّر، قارن، استنتج، برهن…).',
    '3. صحة المعطيات العددية والوحدات في الوثائق والمنحنيات.',
    '4. خلوّ المقترحات الخاطئة (distracteurs) من اللبس العلمي.',
    '',
  );

  const nomFichier = `${vague.id}.md`;
  writeFileSync(join(sortie, nomFichier), lignes.join('\n'), 'utf8');
  indexLignes.push(`- [${vague.titre}](./${nomFichier})`);
}

writeFileSync(join(sortie, 'README.md'), indexLignes.join('\n'), 'utf8');
console.log(`Dossier de relecture SVT généré dans : ${sortie}`);
