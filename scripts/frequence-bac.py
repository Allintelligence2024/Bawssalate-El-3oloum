#!/usr/bin/env python3
"""
P1.7 — Analyse de fréquence des thèmes du Bac SVT (série Sciences Expérimentales)
à partir des sujets archivés dans plans/sources/sujets/SE/ (registre : plans/sources/REGISTRE.md).

Reproductible :  pip install pypdf && python3 scripts/frequence-bac.py
Sorties :
  - plans/analyse-frequence-bac.md   (tableau lisible, méthode, limites)
  - src/data/priorites.ts            (priorite 1|2|3 par leçon — GÉNÉRÉ, ne pas éditer à la main)

Méthode (volontairement simple et vérifiable) :
  1. Texte des sujets à couche texte (pypdf). Les scans (2013–2015, 2016 doublon, 2024–2026) sont ignorés
     et listés comme tels : les compléter à la main dans TABLE_MANUELLE si un relecteur les a lus.
  2. Le corrigé-barème (quand il suit le sujet dans le PDF) est coupé ; découpage en segments sur
     « التمرين الأول/الثاني/الثالث » et « الموضوع الأول/الثاني » (2 موضوع × 3 تمارين par épreuve ; le texte
     extrait étant parfois brouillé, le nombre de segments varie et n'est qu'indicatif).
  3. Chaque segment est attribué à l'unité dont le lexique (MOTS_UNITE) obtient le meilleur score (≥ 3) ;
     un 2e/3e thème est retenu si son score ≥ 1/3 du premier (exercices d'intégration, ex. photosynthèse + respiration).
  4. Fréquence d'une unité = nombre d'épreuves (année-session) où elle apparaît dans ≥ 1 exercice.
  5. Priorité d'une leçon :
       1 si son unité est présente dans ≥ 2/3 des épreuves ET la leçon est citée dans ≥ 2 épreuves
         (expression complète de son `vocabulary`, ou ≥ 2 mots-clés distincts hors mots génériques),
       2 si son unité est présente dans ≥ 1/3 des épreuves OU la leçon est citée dans ≥ 2 épreuves,
       3 sinon (unité d'enrichissement, prérequis, ou thème absent du corpus).
     Les prérequis (2AS) et l'unité 8 (إثرائية) sont plafonnés à 3 : ils ne font pas l'objet d'exercices.
Limites : lexique écrit à la main (biais possible), 10 épreuves texte seulement, OCR absent.
"""
from __future__ import annotations

import re
import sys
import glob
import os
from collections import defaultdict

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.path.join(RACINE, 'plans/sources/sujets/SE')
SORTIE_MD = os.path.join(RACINE, 'plans/analyse-frequence-bac.md')
SORTIE_TS = os.path.join(RACINE, 'src/data/priorites.ts')

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    print('pip install pypdf', file=sys.stderr)
    sys.exit(1)

# Identification lue sur l'épreuve (REGISTRE.md, colonne Vérif.) — pas déduite du nom de fichier
EPREUVES = {
    'dzexams-bac-sciences-4463279.pdf': ('2013', 'جوان', 'scan'),
    'dzexams-bac-sciences-4380238.pdf': ('2014', 'جوان', 'scan'),
    'dzexams-bac-sciences-5906014.pdf': ('2015', 'جوان', 'scan'),
    'dzexams-bac-sciences-2586794.pdf': ('2016', 'عادية', 'texte'),
    'dzexams-bac-sciences-3814840.pdf': ('2016', 'عادية (doublon)', 'scan'),
    'dzexams-bac-sciences-2116452.pdf': ('2017', 'استثنائية', 'texte'),
    'dzexams-bac-sciences-2581269.pdf': ('2017', 'عادية', 'texte'),
    'dzexams-bac-sciences-3509975.pdf': ('2018', 'عادية', 'texte'),
    'dzexams-bac-sciences-3051478.pdf': ('2019', 'عادية', 'texte'),
    'dzexams-bac-sciences-2356016.pdf': ('2020', 'عادية', 'texte'),
    'dzexams-bac-sciences-2728849.pdf': ('2021', 'عادية', 'texte'),
    'dzexams-bac-sciences-2311208.pdf': ('2022', 'عادية', 'texte'),
    'dzexams-bac-sciences-naturelles-1780707.pdf': ('2023', 'عادية', 'texte'),
    'dzexams-bac-sciences-naturelles-1751784.pdf': ('2024', 'عادية', 'scan'),
    'BAC2025_SVT_Sujet1.pdf': ('2025', 'عادية — موضوع 1', 'scan'),
    'BAC2025_SVT_Sujet2.pdf': ('2025', 'عادية — موضوع 2', 'scan'),
    'dzexams-bac-sciences-naturelles-2667863.pdf': ('2026', 'عادية', 'scan'),
}

# Lexique par unité (formes normalisées : sans tashkil, أ/إ/آ→ا, ة→ه, ى→ي). Latin en minuscules.
MOTS_UNITE: dict[str, list[str]] = {
    'u1': ['استنساخ', 'ترجمه', 'arnm', 'arn', 'ريبوزوم', 'الشفره الوراثيه', 'رامزه', 'كودون', 'نووي', 'arnt', 'تركيب البروتين', 'مورثه', 'النسخه'],
    'u2': ['rastop', 'فراغي', 'البنيه الثانويه', 'البنيه الثالثيه', 'البنيه الرابعيه', 'حلزون', 'anagene', 'انفنسن', 'anfinsen', 'تسلسل الاحماض الامينيه', 'الوريقه', 'وريقه', 'جسر ثنايي الكبريت', 'بنيه اوليه', 'البنيه الاوليه'],
    'u3': ['انزيم', 'الانزيم', 'ركيزه', 'الموقع الفعال', 'سرعه التفاعل', 'ph', 'درجه الحراره', 'تثبيط', 'مثبط', 'معقد انزيم', 'vmax', 'km'],
    'u4': ['مناع', 'مستضد', 'جسم مضاد', 'الاجسام المضاده', 'cmh', 'hla', 'لمفاوي', 'lt', 'lb', 'بلعم', 'معقد مناعي', 'سيدا', 'vih', 'hiv', 'طعم', 'الذات', 'اللاذات', 'il2', 'انترلوكين', 'ذاكره', 'خليه بلازميه', 'التحسيس', 'لقاح'],
    'u5': ['عصب', 'مشبك', 'كمون', 'كمون العمل', 'كمون الراحه', 'الناقل العصبي', 'استيل كولين', 'مخدر', 'liaf', 'الادماج', 'المحور الاسطواني', 'سياله', 'عصبون', 'الكمون بعد المشبكي', 'ppse', 'ppsi'],
    'u6': ['تركيب ضوئي', 'التركيب الضوئي', 'يخضور', 'كلوروفيل', 'صانعه', 'تيلاكويد', 'حلقه كالفن', 'كالفن', 'هيل', 'المرحله الكيميوضوئيه', 'co2', 'o2', 'nadph', 'rubp', 'apg', 'الضوء', 'الستروما'],
    'u7': ['تنفس', 'ميتوكوندري', 'كريبس', 'تحلل سكري', 'التخمر', 'تخمر', 'nadh', 'فسفره تاكسديه', 'سلسله تنفسيه', 'الاستروما', 'الهيولي الاساسيه', 'بيروفات', 'حمض البيروفيك', 'اوكسجين', 'atp', 'كحول', 'لبني'],
    'u8': ['تقلص عضلي', 'الاكتين', 'الميوزين', 'فسفوكرياتين', 'الجليكوجين', 'الليف العضلي'],
    'u9': ['صفائح', 'صفيحه', 'ظهره', 'الغوص', 'غوص', 'المغناطيسيه القديمه', 'اتساع قاع المحيط', 'تيارات الحمل', 'الطاقه الداخليه', 'الحراره الارضيه', 'التدفق الحراري', 'البراكين', 'نقاط ساخنه', 'الزلازل', 'بؤر', 'بنيوف', 'gps', 'التباعد', 'التقارب'],
    'u10': ['موجات زلزاليه', 'الموجات الزلزاليه', 'الموهو', 'موهو', 'الرداء', 'النواه', 'البيريدوتيت', 'بازلت', 'غابرو', 'غرانيت', 'الليتوسفير', 'الاستينوسفير', 'الكثافه', 'سرعه الموجات', 'القشره القاريه', 'القشره المحيطيه', 'ذروه السطوع'],
    'u11': ['طيات', 'طيه', 'فوالق', 'فالق', 'تصادم', 'التصادم', 'سلسله جبليه', 'جبال', 'انصهار جزئي', 'الانصهار', 'مغماتيه', 'مغما', 'الصهاره', 'اوفيوليت', 'ميغماتيت', 'تحول', 'صخور متحوله', 'اندزيت', 'ريوليت', 'الصخور الرسوبيه', 'دوره الصخور', 'الهيمالايا', 'الاطلس', 'بترول', 'غاز', 'الموارد'],
}

NOMS_UNITE = {
    'u1': 'تركيب البروتين', 'u2': 'البنية والوظيفة', 'u3': 'النشاط الإنزيمي', 'u4': 'الدفاع عن الذات',
    'u5': 'الاتصال العصبي', 'u6': 'التركيب الضوئي', 'u7': 'التنفّس الخلوي وإنتاج ATP',
    'u8': 'وحدة إثرائية (طاقة)', 'u9': 'النشاط التكتوني للصفائح', 'u10': 'بنية الكرة الأرضية',
    'u11': 'البنيات الجيولوجية',
}

# Unités jamais évaluées par un exercice propre : plafond 3
UNITES_HORS_EXERCICE = {'u8'}
# Mots trop génériques pour « citer » une leçon
STOP = set('''مرحله المرحله الموقع موقع قانون المنطقه منطقه السلاسل الناقل مستقبل حمض سكر الفراغ عوده زوال فرط الكل شيء بين
بدون تجربه مفهوم تاثير درجه عدد نوع عمليه نتيجه الخليه خليه الخلايا جزيء جزييات الجسم اجسام غشاء الغشاء طبقه بنيه البنيه
وظيفه مستوي مستويات الثابته المتغيره الثقيله الخفيفه النهايي النهايه البدايه مجموعه تفاعل التفاعل سرعه نشاط الماده ماده
الطاقه طاقه نموذج نمذجه الشكل تركيب تركيز عامل عوامل مصدر الوسط وسط الجزء النهاية مرحلة'''.split())
LECONS_PREREQUIS = {'prerequis2AS_genetique', 'enzyme_inhibitors', 'amino_acid_behavior'}


def normaliser(s: str) -> str:
    s = s.lower()
    s = re.sub(r'[\u064B-\u0652\u0670\u0640]', ' ', s)  # tashkil/tatwil → espace (pypdf les met entre mots)
    s = re.sub(r'[أإآٱ]', 'ا', s)
    s = s.replace('ى', 'ي').replace('ة', 'ه').replace('ؤ', 'و').replace('ئ', 'ي')
    s = re.sub(r'\s+', ' ', s)
    return s


def lire_programme() -> tuple[dict[str, list[str]], dict[str, str]]:
    """unité → lessonIds ; lessonId → titre (lu dans programme.ts, pas recopié)."""
    src = open(os.path.join(RACINE, 'src/data/programme.ts'), encoding='utf-8').read()
    unites: dict[str, list[str]] = {}
    for m in re.finditer(r"id: '(u\d+)'.*?lessonIds: \[([^\]]*)\]", src, re.S):
        unites[m.group(1)] = re.findall(r"'([^']+)'", m.group(2))
    i = src.index('TITRES_LECONS')
    titres = {m.group(1): m.group(2) for m in re.finditer(r"^\s*'?([\w-]+)'?: '([^']+)'", src[i:], re.M)}
    return unites, titres


def lire_vocabulaire() -> dict[str, list[str]]:
    """lessonId → termes `vocabulary` (lessonGoldSummaries.ts)."""
    src = open(os.path.join(RACINE, 'src/data/lessonGoldSummaries.ts'), encoding='utf-8').read()
    out: dict[str, list[str]] = {}
    for m in re.finditer(r"lessonId: '([^']+)'.*?vocabulary: \[([^\]]*)\]", src, re.S):
        out[m.group(1)] = re.findall(r"'([^']+)'", m.group(2))
    return out


def texte_pdf(chemin: str) -> str:
    r = PdfReader(chemin)
    return '\n'.join((p.extract_text() or '') for p in r.pages)


def decouper_exercices(texte: str) -> list[str]:
    # Marqueurs : « التمرين الأول/الثاني/الثالث » (après normalisation)
    marque = re.compile(r'التمرين (الاول|الثاني|الثالث)|الموضوع (الاول|الثاني)')
    pos = [m.start() for m in marque.finditer(texte)]
    if not pos:
        return [texte]
    segs = []
    for a, b in zip(pos, pos[1:] + [len(texte)]):
        if b - a >= 300:  # en dessous : en-tête « يحتوي الموضوع على … », pas un exercice
            segs.append(texte[a:b])
    return segs


def motif(mot: str) -> re.Pattern[str]:
    m = normaliser(mot)
    if re.fullmatch(r'[a-z0-9 ]+', m):  # jeton latin (ph, km, lt…) : bornes de mot obligatoires
        return re.compile(r'(?<![a-z0-9])' + re.escape(m) + r'(?![a-z0-9])')
    return re.compile(re.escape(m))


MOTIFS = {u: [motif(m) for m in mots] for u, mots in MOTS_UNITE.items()}
MARQUEURS_CORRIGE = ['الاجابه النموذجيه', 'عناصر الاجابه', 'سلم التنقيط', 'التنقيط']


def sans_corrige(texte: str) -> str:
    """Coupe le corrigé-barème qui suit le sujet dans les PDF (il répète les mêmes thèmes)."""
    pos = [m.start() for k in MARQUEURS_CORRIGE for m in re.finditer(k, texte) if m.start() > 5000]
    return texte[: min(pos)] if pos else texte


def score_unites(seg: str) -> dict[str, int]:
    sc: dict[str, int] = {}
    for u, motifs in MOTIFS.items():
        total = 0
        for mo in motifs:
            n = len(mo.findall(seg))
            total += min(n, 6)  # plafond par mot : évite qu'un « ATP » répété 40 fois écrase tout
        sc[u] = total
    return sc


def themes_exercice(seg: str) -> list[str]:
    sc = score_unites(seg)
    ordre = sorted(sc.items(), key=lambda kv: -kv[1])
    if not ordre or ordre[0][1] < 3:
        return []
    meilleur = ordre[0][1]
    return [u for u, s in ordre if s >= max(3, meilleur / 3)][:3]


def main() -> None:
    unites, titres = lire_programme()
    vocab = lire_vocabulaire()
    unite_de = {l: u for u, ls in unites.items() for l in ls}

    epreuves_texte: list[tuple[str, str, str]] = []  # (année, session, texte normalisé)
    ignores: list[tuple[str, str, str]] = []
    for f in sorted(glob.glob(os.path.join(DOSSIER, '*.pdf'))):
        nom = os.path.basename(f)
        annee, session, typ = EPREUVES.get(nom, ('?', '?', 'inconnu'))
        if typ != 'texte':
            ignores.append((nom, annee, session))
            continue
        t = sans_corrige(normaliser(texte_pdf(f)))
        if len(t) < 2000:
            ignores.append((nom, annee, session + ' (texte vide)'))
            continue
        epreuves_texte.append((annee, session, t))

    # Attribution des exercices
    presence: dict[str, set[str]] = defaultdict(set)  # unité → {épreuve}
    nb_exos: dict[str, int] = defaultdict(int)
    detail: list[tuple[str, int, list[str]]] = []  # (épreuve, n° exo, thèmes)
    for annee, session, t in epreuves_texte:
        cle = f'{annee} {session}'
        exos = decouper_exercices(t)
        for i, seg in enumerate(exos, 1):
            th = themes_exercice(seg)
            detail.append((cle, i, th))
            for u in th:
                presence[u].add(cle)
                nb_exos[u] += 1

    # Termes de leçon : nombre d'épreuves où la leçon est « citée » — soit une expression complète du
    # `vocabulary` (ex. « حلقه كالفن »), soit ≥ 2 mots-clés distincts de la leçon (ex. « استقطاب » + « عتبه »).
    hits_lecon: dict[str, int] = {}
    for l, termes in vocab.items():
        phrases = [normaliser(x) for x in termes if len(normaliser(x)) >= 4]
        jetons = {j for x in phrases for j in x.split() if j not in STOP and (len(j) >= 4 or re.fullmatch(r'[a-z0-9]{3,}', j))}
        n = 0
        for annee, session, t in epreuves_texte:
            phrase_ok = any(' ' in ph and ph in t for ph in phrases)
            nb_jetons = sum(1 for j in jetons if motif(j).search(t))
            if phrase_ok or nb_jetons >= 2:
                n += 1
        hits_lecon[l] = n

    N = len(epreuves_texte)
    priorites: dict[str, int] = {}
    for u, ls in unites.items():
        freq = len(presence[u]) / N if N else 0
        for l in ls:
            h = hits_lecon.get(l, 0)
            if l in LECONS_PREREQUIS or u in UNITES_HORS_EXERCICE:
                p = 3
            elif freq >= 2 / 3:
                p = 1 if h >= 2 else 2  # unité fréquente, mais leçon jamais citée → régulier
            elif freq >= 1 / 3 or h >= 2:
                p = 2
            else:
                p = 3
            priorites[l] = p
    # Prérequis hors unités (ex. enzyme_inhibitors) : 3
    for l in titres:
        priorites.setdefault(l, 3)

    # ---- Markdown
    L = []
    L.append('# Analyse de fréquence des thèmes du Bac SVT — P1.7 (générée)\n')
    L.append(f'> Généré par `scripts/frequence-bac.py` à partir de `plans/sources/sujets/SE/` '
             f'({N} épreuves à couche texte sur {N + len(ignores)} fichiers). Relancer le script après tout ajout au registre.\n')
    L.append('> **Statut :** outil interne de priorisation. Les sujets eux-mêmes restent non publiables (droits, A-004). '
             'L\'élève ne voit jamais ces chiffres : seulement un badge qualitatif (« يتكرّر في البكالوريا »).\n')
    L.append('\n## 1. Épreuves analysées\n')
    L.append('| Épreuve | Segments (تمرين/موضوع) détectés |\n|---|---|')
    for annee, session, t in epreuves_texte:
        L.append(f'| {annee} {session} | {len(decouper_exercices(t))} |')
    L.append('\n**Ignorées (scan sans texte, OCR à faire par un relecteur) :** ' + ', '.join(f'{a} {s}' for _, a, s in ignores) + '\n')

    L.append('\n## 2. Fréquence par unité\n')
    L.append('| Unité | Épreuves où elle apparaît | Fréquence | Segments | Années |\n|---|---|---|---|---|')
    for u in unites:
        pres = sorted(presence[u])
        L.append(f'| {u} · {NOMS_UNITE[u]} | {len(pres)}/{N} | {100 * len(pres) / N if N else 0:.0f} % | {nb_exos[u]} | {", ".join(p.split()[0] for p in pres)} |')

    L.append('\n## 3. Attribution exercice par exercice (à relire)\n')
    L.append('| Épreuve | Exo | Thèmes retenus |\n|---|---|---|')
    for cle, i, th in detail:
        L.append(f'| {cle} | {i} | {", ".join(NOMS_UNITE[u] for u in th) or "— (non attribué)"} |')

    L.append('\n## 4. Priorité par leçon (1 = cœur du Bac, 2 = régulier, 3 = enrichissement / prérequis / absent du corpus)\n')
    L.append('| Leçon | Unité | Épreuves citant la leçon | Priorité |\n|---|---|---|---|')
    for u, ls in unites.items():
        for l in ls:
            L.append(f'| {titres.get(l, l)} | {u} | {hits_lecon.get(l, 0)}/{N} | **{priorites[l]}** |')
    for l in titres:
        if l not in unite_de:
            L.append(f'| {titres[l]} | prérequis | — | **{priorites[l]}** |')
    c = defaultdict(int)
    for p in priorites.values():
        c[p] += 1
    L.append(f'\nRépartition : priorité 1 = {c[1]} leçons, 2 = {c[2]}, 3 = {c[3]} (total {len(priorites)}).\n')
    L.append('\n## 5. Limites et usage\n')
    L.append('- Lexique manuel (`MOTS_UNITE`) : un relecteur enseignant doit valider la section 3 ; toute correction se fait dans le script, jamais dans `priorites.ts`.\n'
             '- Les scans 2013–2015 et 2024–2026 manquent : la tendance récente (2024–2026) est donc **sous-représentée**.\n'
             '- Usage dans l\'app : phases du mode intensif (J-60 = priorité 1, J-30 = 1–2), badge discret dans مساري. '
             'Aucun effet sur le verrouillage séquentiel hors mode intensif.\n')
    open(SORTIE_MD, 'w', encoding='utf-8').write('\n'.join(L))

    # ---- TypeScript
    T = []
    T.append('// GÉNÉRÉ par scripts/frequence-bac.py — ne pas éditer à la main (voir plans/analyse-frequence-bac.md).')
    T.append(f'// Corpus : {N} épreuves Bac SE à couche texte ({", ".join(sorted({a for a, _, _ in epreuves_texte}))}).')
    T.append('// 1 = cœur du Bac (unité ≥ 2/3 des épreuves et leçon citée ≥ 2 fois) · 2 = régulier · 3 = enrichissement / prérequis / absent.')
    T.append('')
    T.append('export type Priorite = 1 | 2 | 3;')
    T.append('')
    T.append('export const PRIORITE_LECON: Record<string, Priorite> = {')
    for u, ls in unites.items():
        T.append(f'  // {u} · {NOMS_UNITE[u]} — {len(presence[u])}/{N} épreuves')
        for l in ls:
            T.append(f"  '{l}': {priorites[l]},")
    hors = [l for l in titres if l not in unite_de]
    if hors:
        T.append('  // prérequis hors unités')
        for l in hors:
            T.append(f"  '{l}': {priorites[l]},")
    T.append('};')
    T.append('')
    T.append('/** Priorité d\'une leçon ; 2 (régulier) si la leçon est inconnue du corpus. */')
    T.append('export function prioriteLecon(lessonId: string): Priorite {')
    T.append('  return PRIORITE_LECON[lessonId] ?? 2;')
    T.append('}')
    T.append('')
    open(SORTIE_TS, 'w', encoding='utf-8').write('\n'.join(T))
    print(f'{N} épreuves analysées, {len(ignores)} ignorées → {SORTIE_MD}, {SORTIE_TS}')
    for u in unites:
        print(f'  {u:4} {len(presence[u])}/{N}  exos={nb_exos[u]}')
    print('priorités :', dict(c))


if __name__ == '__main__':
    main()
