# Inventaire des images du livre — بوصلة العلوم Lite

**Phase 0 — Étape 1 + Étape 2 (audit puis tri Drive sur GO).** Dossier source Google Drive : `Images Of Book Science (compressed)` (`1SbXK8wlKqICb-X7mu3tYt5jeR0O4cD_L`).

Généré le **2026-11-26** à partir des **111 fichiers JPEG** réellement téléchargés, vérifiés octet par octet + MD5, puis lus **un par un en vision multimodale** (jamais d’après le nom de fichier). Le manifeste ci-dessous intègre l’ajustement `أشنة` demandé avant tri. L’Étape 2 est exécutée après **GO explicite** : création des 13 sous-dossiers, déplacement + renommage des 111 fichiers, **zéro suppression**, aucun fichier `src/` modifié, aucun commit Git, aucun `reviewed: true`. Toute image intégrable restera `statut: 'a_valider_enseignant'`.

Fichiers livrés **hors commit** : `plans/inventaire-images-livre.json` (manifest machine, 111 objets) et `plans/INVENTAIRE-IMAGES-LIVRE.md` (ce rapport).

**Ajustement avant GO (2026-11-26)** : `أشنة` / `أشنة خضراء` (Chlorella) est un terme officiel exact du manuel et du Bac 3AS. Les défauts qui le traitaient comme une erreur ont été retirés. Après re-vérification visuelle, **l’image 42** ne présente plus aucun défaut → repassée `OK` vers `06_U6_Photosynthese`. Les images **43** et **49** restent `FIX_TEXT` pour leurs autres défauts réels (phrase corrompue, noms approximatifs, `للركب`, `مصادر ضوء متكرّرة`).

## 1. Compteurs globaux

| Indicateur | Valeur |
|---|---|
| **Total** | **111** images |
| **OK** | **23** |
| **FIX_TEXT** | **80** |
| **REJECT** | **8** |
| **Poids total** | **24.94 Mo** (26 152 748 octets) |
| Empreintes MD5 uniques | 106 |
| Paires de doublons exacts | 5 |

### Répartition par dossier cible **proposé** (Étape 2 non exécutée)

| Dossier cible | Images |
|---|---:|
| `00_QA_A_Corriger_IA` | 76 |
| `01_U1_Synthese_Proteines` | 0 |
| `02_U2_Structure_Fonction` | 0 |
| `03_U3_Enzymes` | 0 |
| `04_U4_Immunite` | 0 |
| `05_U5_Systeme_Nerveux` | 0 |
| `06_U6_Photosynthese` | 9 |
| `07_U7_Respiration_Fermentation` | 2 |
| `08_U8_Bilan_Energetique` | 2 |
| `09_U9_Tectonique_Plaques` | 4 |
| `10_U10_Structure_Terre` | 0 |
| `11_U11_Phenomenes_Geologiques` | 4 |
| `99_Enrichissement_ou_Doublons` | 14 |

Lecture des écarts : 23 `OK` = 21 images d’unités + 2 `enrichissement` ; 80 `FIX_TEXT` = 76 à corriger + 4 `enrichissement` ; 8 `REJECT` (dont 6 `doublon`) complètent `99_Enrichissement_ou_Doublons`.

## 2. Couverture par unité `u1`…`u11`

Les leçons listées sont les `lessonIds` officiels de `src/data/programme.ts`. « Aucune image » signifie qu’aucun fichier du dossier source n’a été rattaché à cette leçon. Le décompte inclut les images `OK`, `FIX_TEXT` et `REJECT` rattachées à l’unité (pas seulement les images intégrables). Les `enrichissement` / `doublon` sont comptés à part en fin de section.

### `u1` — 5 leçons, 0 images

| Leçon | Titre | Images |
|---|---|---:|
| `d1-u1-l1-expression-genique` | تقديم الوحدة: من المورثة إلى البروتين | **0 — aucune image** |
| `phase1_chapitres_1_2` | مقرّ تركيب البروتين | **0 — aucune image** |
| `lecon_transcription` | الاستنساخ | **0 — aucune image** |
| `phase1_chapitres_1_2_2` | الشفرة الوراثية وتنشيط الأحماض الأمينية | **0 — aucune image** |
| `phase2_chapitres_3_4` | مراحل الترجمة | **0 — aucune image** |

### `u2` — 4 leçons, 0 images

| Leçon | Titre | Images |
|---|---|---:|
| `lecon_representation` | النمذجة الفراغية (Rastop) | **0 — aucune image** |
| `phase2_chapitres_3_4_2` | مستويات البنية الفراغية | **0 — aucune image** |
| `amino_acid_behavior` | سلوك الأحماض الأمينية وهجرتها الكهربائية | **0 — aucune image** |
| `phase3_chapitres_5_6` | البنية والوظيفة (تجربة أنفنصن) | **0 — aucune image** |

### `u3` — 6 leçons, 1 image

| Leçon | Titre | Images |
|---|---|---:|
| `phase3_chapitres_5_6_2` | مفهوم الإنزيم | 1 |
| `lecon_activite_structure` | النشاط الإنزيمي وعلاقته بالبنية | **0 — aucune image** |
| `phase4_chapitres_7_8` | تأثير درجة الحموضة (pH) | **0 — aucune image** |
| `phase4_chapitres_7_8_2` | تأثير درجة الحرارة | **0 — aucune image** |
| `d1-u3-l1-enzyme` | تأثير تركيز الركيزة على سرعة التفاعل | **0 — aucune image** |
| `enzyme_inhibitors` | تثبيط الإنزيمات | **0 — aucune image** |

### `u4` — 8 leçons, 0 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase5_chapitres_9_10` | الذات واللاذات ونظام CMH | **0 — aucune image** |
| `phase5_chapitres_9_10_2` | الزمر الدموية (ABO و Rh) | **0 — aucune image** |
| `phase6_chapitres_11_12` | مصدر الأجسام المضادة | **0 — aucune image** |
| `phase6_chapitres_11_12_2` | المعقد المناعي والبلعمة | **0 — aucune image** |
| `phase7_chapitres_13_14` | الاستجابة المناعية الخلوية (LTc) | **0 — aucune image** |
| `phase7_chapitres_13_14_2` | تنسيق الاستجابة (LT4 و IL-2) | **0 — aucune image** |
| `immunity_memory_response` | الاستجابة المناعية الذاكرة | **0 — aucune image** |
| `immunity_hiv_aids` | اختيار نمط الاستجابة وفقدان المناعة المكتسبة | **0 — aucune image** |

### `u5` — 5 leçons, 1 image

| Leçon | Titre | Images |
|---|---|---:|
| `phase8_chapitres_15_16` | الكمون الكهربائي للراحة | **0 — aucune image** |
| `phase8_chapitres_15_16_2` | الكمون الكهربائي للعمل | **0 — aucune image** |
| `phase9_chapitres_17_18` | النقل المشبكي | 1 |
| `phase9_chapitres_17_18_2` | الإدماج العصبي | **0 — aucune image** |
| `phase10_chapitres_19_20` | تأثير المخدرات على المشابك | **0 — aucune image** |

### `u6` — 7 leçons, 32 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase10_chapitres_19_20_2` | مقرّ التركيب الضوئي | 4 |
| `phase11_chapitres_21_22_2` | المرحلة الكيميوضوئية | 11 |
| `d2-u6-l1-hill-ruben` | تجربة هيل وروبن (1937 / 1941) | 6 |
| `d2-u6-l2-jagendorf` | تجربة جاغندورف (1966) | 2 |
| `phase12_chapitres_23_24` | المرحلة الكيميوحيوية وحلقة كالفن | 2 |
| `d2-u6-l3-calvin` | تجربة كالفن | 4 |
| `phase12_chapitres_23_24_2` | التكامل بين المرحلتين | 3 |

### `u7` — 5 leçons, 18 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase13_chapitres_25_26` | التحلّل السكري | 2 |
| `phase13_chapitres_25_26_2` | حلقة كريبس | 2 |
| `phase14_chapitres_27_28` | الفسفرة التأكسدية | 3 |
| `d2-u7-l1-mitchell-racker` | تجربة ميتشل وراكر (1961 / 1974) | 6 |
| `phase14_chapitres_27_28_2` | الوسط اللاهوائي والتخمّر | 5 |

### `u8` — 2 leçons, 4 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase15_chapitres_29_30` | التحوّلات الطاقوية الخلوية | 4 |
| `phase15_chapitres_29_30_2` | دورة الطاقة والمادة | **0 — aucune image** |

### `u9` — 5 leçons, 10 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase16_chapitres_31_32` | تحديد الصفائح التكتونية | 1 |
| `phase16_chapitres_31_32_2` | اتساع قاع المحيط والمغناطيسية القديمة | **0 — aucune image** |
| `phase17_chapitres_33_34` | الظواهر المرتبطة بالغوص | 7 |
| `phase18_chapitres_35_36` | الطاقة الداخلية للكرة الأرضية | 1 |
| `phase18_chapitres_35_36_2` | تيارات الحمل الحراري محرك الصفائح | 1 |

### `u10` — 3 leçons, 0 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase19_chapitres_37_38` | الموجات الزلزالية | **0 — aucune image** |
| `phase19_chapitres_37_38_2` | التركيب الكيميائي للصخور | **0 — aucune image** |
| `phase20_chapitres_39_40` | النمذجة البنيوية للأرض | **0 — aucune image** |

### `u11` — 5 leçons, 32 images

| Leçon | Titre | Images |
|---|---|---:|
| `phase17_chapitres_33_34_2` | الانصهار الجزئي في مناطق الغوص | 5 |
| `phase20_chapitres_39_40_2` | شواهد التقلص: الطيات والفوالق | 11 |
| `phase21_chapitres_41_42` | المغماتية وتشكّل اللوح المحيطي | 6 |
| `phase21_chapitres_41_42_2` | التضاريس الناجمة عن التصادم | 5 |
| `d3-u11-l1-migmatite` | المغماتيت وشواهد التقلص | 5 |

**Hors unités** : `enrichissement` = 7 images, `doublon` = 6 images (direction proposée : `99_Enrichissement_ou_Doublons`).

## 3. Tableau complet des 111 images à trier

| N° | Nom Drive | Octets | Unité | Leçon | Doc | Titre arabe lu | QA | Défauts IA exacts | Dossier cible | Nom proposé |
|---:|---|---:|---|---|---:|---|---|---|---|---|
| 1 | `Gemini_Generated_Image - 2026-11-21T122905.854.jpeg` | 217461 | `u11` | `phase21_chapitres_41_42` | 12 | مخطط ضغط – حرارة انصهار البيريدويتيت | **FIX_TEXT** | جيو حراري القفرات (au lieu de الجيوحراري للقارات) ; تسلب البيريدويت (au lieu de تصلب البيريدوتيت) ; (Gp) au lieu de (GPa) | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42__A_CORRIGER__doc12__mkhtt-dght-hrara-anshar-albyrydwytyt-img001.jpeg` |
| 2 | `Gemini_Generated_Image - 2026-11-21T122909.528.jpeg` | 201154 | `u11` | `phase21_chapitres_41_42` | 11 | نمذجة الانصهار الجزيئي | **FIX_TEXT** | الانصهار الجزيئي au lieu de الانصهار الجزئي ; afficheurs inversés « T : 20°C / 50°C / 80°C » rendus « 20°C : T » | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42__A_CORRIGER__doc11__nmdhja-alanshar-aljzyiy-img002.jpeg` |
| 3 | `Gemini_Generated_Image - 2026-11-21T122912.412.jpeg` | 157035 | `u11` | `phase21_chapitres_41_42` | 10 | نمذجة الانصهار التجريبي للبيريدويتيت | **FIX_TEXT** | تلمجة au lieu de نمذجة ; البيروديت / البيرودويت au lieu de البيريدوتيت ; الهيكل المبلور au lieu de الهيكل المتبلور | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42__A_CORRIGER__doc10__nmdhja-alanshar-altjryby-llbyrydwytyt-img003.jpeg` |
| 4 | `Gemini_Generated_Image - 2026-11-21T122915.321.jpeg` | 105761 | `u11` | `phase21_chapitres_41_42` | 9 | مجال انصهار البيريدويتيت تحت تأثير الضغط والحرارة | **OK** | — | `11_U11_Phenomenes_Geologiques` | `phase21_chapitres_41_42__doc09__mjal-anshar-albyrydwytyt-tht-tathyr-aldght-walhrara-img004.jpeg` |
| 5 | `Gemini_Generated_Image - 2026-11-21T122920.228.jpeg` | 348644 | `enrichissement` | `phase22_chapitres_43_44` | 6 | صورة بالمجهر المستقطب لنتائج الشريحة التي وضعت فوق الحمام المائي | **FIX_TEXT** | libellés d'interface parasites « أسماء T », « مختبر التحاليل المقدمة » ; micro-textes latins illisibles dans les panneaux de gauche | `99_Enrichissement_ou_Doublons` | `enrichissement__phase22_chapitres_43_44__A_CORRIGER__doc06__swra-balmjhr-almstqtb-lntaij-alshryha-alty-wdat-fwq-alhmam-almai-img005.jpeg` |
| 6 | `Gemini_Generated_Image - 2026-11-21T122923.491.jpeg` | 249177 | `enrichissement` | `phase22_chapitres_43_44` | 6 | صورة بالمجهر المستقطب لنتائج الشريحة التي وضعت فوق الحمام المائي | **FIX_TEXT** | تبلور البوليمر (hors sujet : polymère au lieu de roche/minéral) ; texte latin corrompu « مؤسسة البحاث … Crystallization data » ; échelle « °F » avec « 10°C » incohérente | `99_Enrichissement_ou_Doublons` | `enrichissement__phase22_chapitres_43_44__A_CORRIGER__doc06__swra-balmjhr-almstqtb-lntaij-alshryha-alty-wdat-fwq-alhmam-almai-img006.jpeg` |
| 7 | `Gemini_Generated_Image - 2026-11-21T122925.532.jpeg` | 319842 | `enrichissement` | `phase22_chapitres_43_44` | 5 | صورة بالمجهر المستقطب لنتائج الشريحة التي وضعت في الهواء الطلق / في الثلاجة (الوثيقتان 5 et 4) | **OK** | — | `99_Enrichissement_ou_Doublons` | `99__phase22_chapitres_43_44__doc05__swra-balmjhr-almstqtb-lntaij-alshryha-alty-wdat-fy-alhwa-altlq-f-img007.jpeg` |
| 8 | `Gemini_Generated_Image - 2026-11-21T122929.555.jpeg` | 262133 | `enrichissement` | `phase22_chapitres_43_44` | 5 | دراسة مقارنة للبلورات المعدنية تحت ظروف تبريد مختلفة (الوثيقتان 5 et 4) | **FIX_TEXT** | « Photo 4 (Refrigerator Slide) » répété deux fois sur le même panneau ; référence latine corrompue « *Microreferences (Mam.6u00, 28, 41) » | `99_Enrichissement_ou_Doublons` | `enrichissement__phase22_chapitres_43_44__A_CORRIGER__doc05__drasa-mqarna-llblwrat-almadnya-tht-zrwf-tbryd-mkhtlfa-alwthyqtan-img008.jpeg` |
| 9 | `Gemini_Generated_Image - 2026-11-21T122931.249.jpeg` | 175612 | `enrichissement` | `phase22_chapitres_43_44` | 5 | مشروع دراسة التبلور — صورة مجهرية مكبّرة لنتائج الشريحة (الوثيقتان 5 et 4) | **OK** | — | `99_Enrichissement_ou_Doublons` | `99__phase22_chapitres_43_44__doc05__mshrwa-drasa-altblwr-swra-mjhrya-mkb-ra-lntaij-alshryha-alwthyqt-img009.jpeg` |
| 10 | `Gemini_Generated_Image - 2026-11-21T122934.190.jpeg` | 240282 | `enrichissement` | `phase22_chapitres_43_44` | 5 | تحليل بلوري متقدم – دراسة مقارنة (الوثيقتان 5 et 4) | **FIX_TEXT** | « Air Quality Data » / « Particulate Count » / « Storage Temp Log » : libellés latins hors sujet ; micro-texte latin illisible/inventé dans les encadrés | `99_Enrichissement_ou_Doublons` | `enrichissement__phase22_chapitres_43_44__A_CORRIGER__doc05__thlyl-blwry-mtqdm-drasa-mqarna-alwthyqtan-5-et-4-img010.jpeg` |
| 11 | `Gemini_Generated_Image (1).jpeg` | 144647 | `u6` | `d2-u6-l1-hill-ruben` | — | تركيز O₂ في الوسط (وحدة إعتبارية) — ظلام/ضوء, ¹⁸O₂ / ¹⁶O₂ | **FIX_TEXT** | إعتبارية (hamza fautive : اعتبارية) ; texte latin inventé « flaws re-typed logic flaw flawlessly condition perfectly … » ; texte latin inventé « Central Text flawlessly flawed flaws … enogicall » ; texte latin inventé « energy Callout logically flaw logical condition flawlessly … » | `00_QA_A_Corriger_IA` | `u6__d2-u6-l1-hill-ruben__A_CORRIGER__doc00__trkyz-o2-fy-alwst-whda-iatbarya-zlam-dw-18o2-16o2-img011.jpeg` |
| 12 | `Gemini_Generated_Image (2).jpeg` | 221692 | `u7` | `d2-u7-l1-mitchell-racker` | — | تركيز الـ Na⁺ في الداخل / تدفّق K⁺ نحو الداخل — إضافة DNP (0.2 ملغ/لتر) | **FIX_TEXT** | « logicMapping condition flawlessly » ; « condition conditions mappings » ; « expertly condition maplessly » ; micro-textes latins illisibles sur les axes | `00_QA_A_Corriger_IA` | `u7__d2-u7-l1-mitchell-racker__A_CORRIGER__doc00__trkyz-al-na-fy-aldakhl-tdf-q-k-nhw-aldakhl-idafa-dnp-0-2-mlgh-lt-img012.jpeg` |
| 13 | `Gemini_Generated_Image (3).jpeg` | 128815 | `u6` | `d2-u6-l1-hill-ruben` | — | كمية O₂ المنطلق بدلالة شدة الإضاءة (المنحنى ص / المنحنى س) | **FIX_TEXT** | « المنحنى ص » répété en légende « ص / المنحنى ص » (doublon de texte) ; micro-textes latins illisibles en fond de graphique | `00_QA_A_Corriger_IA` | `u6__d2-u6-l1-hill-ruben__A_CORRIGER__doc00__kmya-o2-almntlq-bdlala-shda-alidaa-almnhna-s-almnhna-s-img013.jpeg` |
| 14 | `Gemini_Generated_Image (4).jpeg` | 279393 | `u8` | `phase15_chapitres_29_30` | — | كائن حي وحيد الخلية / تركيز منخفض – تركيز عالي → ATP (besoins énergétiques) | **OK** | — | `08_U8_Bilan_Energetique` | `phase15_chapitres_29_30__doc00__kain-hy-whyd-alkhlya-trkyz-mnkhfd-trkyz-aaly-atp-besoins-nerg-ti-img014.jpeg` |
| 15 | `Gemini_Generated_Image (5).jpeg` | 150723 | `u8` | `phase15_chapitres_29_30` | 4 | جزيئة الأدينوزين ثلاثي الفسفات (ATP) | **FIX_TEXT** | « الوثيقة (4) » répété deux fois (bandeau gauche et droite) ; « Adenosine Tri Phosphate » en trois mots au lieu de Adenosine Triphosphate | `00_QA_A_Corriger_IA` | `u8__phase15_chapitres_29_30__A_CORRIGER__doc04__jzyia-aladynwzyn-thlathy-alfsfat-atp-img015.jpeg` |
| 16 | `Gemini_Generated_Image (6).jpeg` | 255947 | `u8` | `phase15_chapitres_29_30` | 1 | انتقال الطاقة في خلية نباتية يخضورية أثناء النهار/الليل وخلية غير يخضورية (الوثائق 1, 2, 3) | **OK** | — | `08_U8_Bilan_Energetique` | `phase15_chapitres_29_30__doc01__antqal-altaqa-fy-khlya-nbatya-ykhdwrya-athna-alnhar-allyl-wkhlya-img016.jpeg` |
| 17 | `Gemini_Generated_Image (7).jpeg` | 282659 | `u8` | `phase15_chapitres_29_30` | — | تحولات الطاقة في محرك سيارة / في خلية حية | **FIX_TEXT** | « إحتراق » (hamza fautive : احتراق) ; « Pa+ » texte latin corrompu près de la pompe Na⁺/K⁺ ; « Citric Acid Cycle » et micro-textes latins parasites | `00_QA_A_Corriger_IA` | `u8__phase15_chapitres_29_30__A_CORRIGER__doc00__thwlat-altaqa-fy-mhrk-syara-fy-khlya-hya-img017.jpeg` |
| 18 | `Gemini_Generated_Image (8).jpeg` | 162377 | `u7` | `d2-u7-l1-mitchell-racker` | — | بكتيريورودوبسين — غشاء هيولي، ضوء، H⁺, ADP + Pi → ATP | **REJECT** | cellule dessinée en globule rouge biconcave au lieu d'une membrane d'Halobacterium (erreur scientifique) ; « بكتيريورودوبسين » mal orthographié ; micro-textes latins illisibles | `99_Enrichissement_ou_Doublons` | `99__d2-u7-l1-mitchell-racker__doc00__bktyrywrwdwbsyn-ghsha-hywly-dw-h-adp-pi-atp-img018.jpeg` |
| 19 | `Gemini_Generated_Image (9).jpeg` | 209412 | `u7` | `phase13_chapitres_25_26_2` | — | تفاعلات حلقة كريبس / تفاعلات الفسفرة التأكسدية | **FIX_TEXT** | « نقل الإلكترونات للأكسجين بالأكسجين العبور بالأكسجين » (phrase arabe corrompue) ; « Glentilling Mapplesly mapped » (latin inventé) ; « أستيل-مرافق الإنزيم أ / Acetyle COA » au lieu de أسيتيل / Acetyl-CoA | `00_QA_A_Corriger_IA` | `u7__phase13_chapitres_25_26_2__A_CORRIGER__doc00__tfaalat-hlqa-krybs-tfaalat-alfsfra-altaksdya-img019.jpeg` |
| 20 | `Gemini_Generated_Image (10).jpeg` | 102932 | `u5` | `phase9_chapitres_17_18` | 5 | الهيولى — مستقبل 1 / ناقل 2 / تحفيز 3 / إخراج 4 / عامل «س» | **FIX_TEXT** | « مُستهدف 9 » (numéro incohérent, doublon de « مُستهدف ») ; micro-textes latins illisibles en fond | `00_QA_A_Corriger_IA` | `u5__phase9_chapitres_17_18__A_CORRIGER__doc05__alhywla-mstqbl-1-naql-2-thfyz-3-ikhraj-4-aaml-s-img020.jpeg` |
| 21 | `Gemini_Generated_Image (11).jpeg` | 183892 | `u7` | `phase14_chapitres_27_28_2` | 4 | الوثيقة (4) — تفاعلات التحلّل السكري والتخمّر الكحولي (غلوكوز → 2 حمض البيروفيك → 2 إيثانول) | **OK** | — | `07_U7_Respiration_Fermentation` | `phase14_chapitres_27_28_2__doc04__alwthyqa-4-tfaalat-althl-l-alskry-waltkhm-r-alkhwly-ghlwkwz-2-hm-img021.jpeg` |
| 22 | `Gemini_Generated_Image (12).jpeg` | 271082 | `u7` | `phase14_chapitres_27_28_2` | 3 | مخطط يوضّح النواتج النهائية للمسارات التنفّسية والتخمّرية | **FIX_TEXT** | « ربع صافي / ربع (الإجمالي 38) » au lieu de « ربح صافي / الربح » ; « (CO₂) CO₂ » redondant ; « الطاقة الكيميائية معلمة » (mot tronqué) | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28_2__A_CORRIGER__doc03__mkhtt-ywd-h-alnwatj-alnhaiya-llmsarat-altnf-sya-waltkhm-rya-img022.jpeg` |
| 23 | `Gemini_Generated_Image (13).jpeg` | 172314 | `u7` | `phase14_chapitres_27_28_2` | 2 | تطوّر كتلة الخميرة في وجود الأكسجين وفي غيابه | **FIX_TEXT** | « شفافية الوسط (% الضوء المُرسل بـ) » : syntaxe arabe corrompue ; micro-textes latins illisibles sur le graphique | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28_2__A_CORRIGER__doc02__ttw-r-ktla-alkhmyra-fy-wjwd-alaksjyn-wfy-ghyabh-img023.jpeg` |
| 24 | `Gemini_Generated_Image (14).jpeg` | 151060 | `u7` | `phase14_chapitres_27_28_2` | 1 | نتائج تجربة قياس نوائج التخمّر الكحولي في الوسط اللاهوائي | **FIX_TEXT** | « نوائج » au lieu de « نواتج » ; « الزمن (بالتواني) » au lieu de « الزمن (بالثواني) » ; « الزمن (بثاني) » (second axe, même corruption) ; libellés « CO₂ / 0,1 », « C1.250 », « C25,85 » parasites | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28_2__A_CORRIGER__doc01__ntaij-tjrba-qyas-nwaij-altkhm-r-alkhwly-fy-alwst-allahwaiy-img024.jpeg` |
| 25 | `Gemini_Generated_Image (15).jpeg` | 196570 | `u6` | `phase12_chapitres_23_24` | 5 | رسم تخطيطي لتفاعلات الصانعة الخضراء | **FIX_TEXT** | formules chimiques corrompues « غلوكوز CH₁₂N₂O₅ 17 C », « ماء C₆H₁₂O₆ 103 C », « حمض البيروفيك H₂O₄ 10 C » ; numéros de cases 1–8 partiellement incohérents | `00_QA_A_Corriger_IA` | `u6__phase12_chapitres_23_24__A_CORRIGER__doc05__rsm-tkhtyty-ltfaalat-alsanaa-alkhdra-img025.jpeg` |
| 26 | `Gemini_Generated_Image (16).jpeg` | 255541 | `u7` | `phase14_chapitres_27_28` | 5 | رسم تخطيطي يوضّح آلية الفسفرة التأكسدية | **FIX_TEXT** | « متلازمة الأكسدة الإرجاعية » au lieu de « تفاعلات الأكسدة والإرجاع » ; « متراكات البروتين » (mot corrompu) ; « ملي فولط » et micro-textes latins parasites | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28__A_CORRIGER__doc05__rsm-tkhtyty-ywd-h-alya-alfsfra-altaksdya-img026.jpeg` |
| 27 | `Gemini_Generated_Image (17).jpeg` | 236330 | `u7` | `phase14_chapitres_27_28` | 4 | رسم تخطيطي يوضّح آلية الفسفرة التأكسدية (الإلكترونية) | **FIX_TEXT** | « g² » répété sur les transporteurs (au lieu des cytochromes T₁/T₃/T₄ corrects) ; « متراكات البروتين » (mot corrompu) | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28__A_CORRIGER__doc04__rsm-tkhtyty-ywd-h-alya-alfsfra-altaksdya-alilktrwnya-img027.jpeg` |
| 28 | `Gemini_Generated_Image (18).jpeg` | 183180 | `u7` | `d2-u7-l1-mitchell-racker` | 2 | نتائج تجربة قياس درجة pH الـ في معلّق ميتوكندريا معزولة | **FIX_TEXT** | « درجة pH الـ في معلّق » (article « الـ » parasite, phrase tronquée) ; « معقّد TH,H⁺ » au lieu de « NADH,H⁺ » ; « DNP الـ » (ordre des mots inversé) | `00_QA_A_Corriger_IA` | `u7__d2-u7-l1-mitchell-racker__A_CORRIGER__doc02__ntaij-tjrba-qyas-drja-ph-al-fy-mal-q-mytwkndrya-mazwla-img028.jpeg` |
| 29 | `Gemini_Generated_Image (19).jpeg` | 299974 | `u7` | `d2-u7-l1-mitchell-racker` | 1 | نتائج التجارب على الحويصلات الثانية من تفريق الغشاء الداخلي للميتوكندريا | **FIX_TEXT** | « التمزيق (الشريّق) » (mot inventé) ; « (مقلوبة - مقلوبة) » répété ; « حويصلات خالية من الخويصلات ويقاء (F0 فقط) » (phrase corrompue) ; « نقل الإلكترونات - تركيب الـ ATP » sans verbe | `00_QA_A_Corriger_IA` | `u7__d2-u7-l1-mitchell-racker__A_CORRIGER__doc01__ntaij-altjarb-ala-alhwyslat-althanya-mn-tfryq-alghsha-aldakhly-l-img029.jpeg` |
| 30 | `Gemini_Generated_Image (20).jpeg` | 269753 | `u7` | `phase13_chapitres_25_26_2` | 2 | تفاعلات حلقة كريبس والخطوة التحضيرية لها | **FIX_TEXT** | « أستيل كو أ (Acetyl-CoA) » au lieu de « أسيتيل » ; « الحدّ الزمني (الحدّ الزمني) حلقة كريبس » répété ; « NADH+H » sans exposant « + » ; « تفاعلات الـ FAD الـ / إطلاق » (mots parasites) | `00_QA_A_Corriger_IA` | `u7__phase13_chapitres_25_26_2__A_CORRIGER__doc02__tfaalat-hlqa-krybs-walkhtwa-althdyrya-lha-img030.jpeg` |
| 31 | `Gemini_Generated_Image (21).jpeg` | 201351 | `u3` | `phase3_chapitres_5_6_2` | 6 | خروج الناتج: السكروز — دخول مادتي التفاعل: غلوكوز وفركتوز | **FIX_TEXT** | « ارتباط مادي التفاعل بوقع الفعال » au lieu de « بالموقع الفعّال » ; « اختصاص » au lieu de « التخصص/النوعية » ; « الموقع الفعال للأنزيم شاغر » (avec hamza fautive أنزيم) | `00_QA_A_Corriger_IA` | `u3__phase3_chapitres_5_6_2__A_CORRIGER__doc06__khrwj-alnatj-alskrwz-dkhwl-madty-altfaal-ghlwkwz-wfrktwz-img031.jpeg` |
| 32 | `Gemini_Generated_Image (21)(1).jpeg` | 174614 | `u6` | `phase12_chapitres_23_24_2` | 1 | تركيز O₂ / CO₂ (ميكرومول/لتر) بدلالة الزمن (بالدقائق) | **FIX_TEXT** | « النقطة الدينية » au lieu de « النقطة الدنيا » ; micro-textes latins illisibles en fond | `00_QA_A_Corriger_IA` | `u6__phase12_chapitres_23_24_2__A_CORRIGER__doc01__trkyz-o2-co2-mykrwmwl-ltr-bdlala-alzmn-baldqaiq-img032.jpeg` |
| 33 | `Gemini_Generated_Image (22).jpeg` | 156558 | `enrichissement` | `phase22_chapitres_43_44` | — | Appareil de laboratoire (interface « النظام البصري / التحكم في الحرارة ») | **REJECT** | texte d'interface arabe illisible/corrompu, chiffres « 1.000 5.000 » sans unité ; aucun numéro de document, image d'appareil générique hors programme | `99_Enrichissement_ou_Doublons` | `99__phase22_chapitres_43_44__doc00__appareil-de-laboratoire-interface-alnzam-albsry-althkm-fy-alhrar-img033.jpeg` |
| 34 | `Gemini_Generated_Image (23).jpeg` | 193769 | `u7` | `d2-u7-l1-mitchell-racker` | 1 | صورة لجهاز تقني صمّم لإجراء التجارب العلمية المدعّمة بالحاسوب (الواجهات) + الوثيقة (2) | **OK** | — | `07_U7_Respiration_Fermentation` | `d2-u7-l1-mitchell-racker__doc01__swra-ljhaz-tqny-sm-m-lijra-altjarb-alalmya-almda-ma-balhaswb-alw-img034.jpeg` |
| 35 | `Gemini_Generated_Image (24).jpeg` | 298190 | `u7` | `phase14_chapitres_27_28` | 5 | البنية الجزيئية لغشائي الميتوكندريا | **FIX_TEXT** | « بروتينات كروية بروفسفورية » (mot corrompu) ; « مركّبات بروتينية مؤشّرة » (mot corrompu) ; « ATP صانعة معقّد » (ordre des mots inversé) ; « TEP 38,9° volt » (unité inventée) | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28__A_CORRIGER__doc05__albnya-aljzyiya-lghshaiy-almytwkndrya-img035.jpeg` |
| 36 | `Gemini_Generated_Image (25).jpeg` | 226205 | `u7` | `phase13_chapitres_25_26` | 3 | رسم تخطيطي للميتوكندري | **FIX_TEXT** | « للميتوكندري » au lieu de « للميتوكندريا » ; « ADN ميتوكندري / ريبوزومات ميتوكندري » (adjectif sans ة) ; micro-légende « H⁺ NO ETC H⁺ AFO » illisible | `00_QA_A_Corriger_IA` | `u7__phase13_chapitres_25_26__A_CORRIGER__doc03__rsm-tkhtyty-llmytwkndry-img036.jpeg` |
| 37 | `Gemini_Generated_Image (26).jpeg` | 206113 | `u7` | `phase13_chapitres_25_26` | 2 | صورة بالمجهر الإلكتروني النافذ لمقطع في ميتوكندريا | **FIX_TEXT** | « عُروف » au lieu de « أعراف » ; « حَشوة داخلي » (adjectif sans ة) ; « غشاء داخلي » écrit « غشاء داخلي » avec micro-texte latin illisible | `00_QA_A_Corriger_IA` | `u7__phase13_chapitres_25_26__A_CORRIGER__doc02__swra-balmjhr-alilktrwny-alnafdh-lmqta-fy-mytwkndrya-img037.jpeg` |
| 38 | `Gemini_Generated_Image (27).jpeg` | 297614 | `u7` | `phase14_chapitres_27_28_2` | 1 | خلايا الخميرة كما تبدو تحت المجهر الإلكتروني النّافذ (وسط هوائي / لا هوائي) | **FIX_TEXT** | « وسط لا هوائي » en deux mots au lieu de « لاهوائي » ; micro-textes latins illisibles dans les panneaux | `00_QA_A_Corriger_IA` | `u7__phase14_chapitres_27_28_2__A_CORRIGER__doc01__khlaya-alkhmyra-kma-tbdw-tht-almjhr-alilktrwny-aln-afdh-wst-hwai-img038.jpeg` |
| 39 | `Gemini_Generated_Image (28).jpeg` | 201038 | `u6` | `phase11_chapitres_21_22_2` | — | الخيط الطحلبي — تجمّع بكتيري هوائي et spectre 380–750 nm (Engelmann) | **FIX_TEXT** | « تجمّع بكتيري كثيف بعد الإنتاجية » (terme « الإنتاجية » hors sens) ; libellé « البكتيريا (الهوائية) » mal accordé | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc00__alkhyt-althlby-tjm-a-bktyry-hwaiy-et-spectre-380-750-nm-engelman-img039.jpeg` |
| 40 | `Gemini_Generated_Image (29).jpeg` | 192437 | `u6` | `phase11_chapitres_21_22_2` | — | آلية نقل الإلكترونات وتركيب الـ ATP عند البكتيريا الزرقاء | **FIX_TEXT** | « معقّد صانعة ATP الـ » (ordre des mots + article « الـ » parasite) ; « PSI » collé, micro-textes latins illisibles | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc00__alya-nql-alilktrwnat-wtrkyb-al-atp-and-albktyrya-alzrqa-img040.jpeg` |
| 41 | `Gemini_Generated_Image (30).jpeg` | 168704 | `u6` | `phase11_chapitres_21_22_2` | 1 | الحالة الأصلية P 870 / الحالة المُهيّجة (P′ 870) — كمون الأكسدة/الإرجاع | **FIX_TEXT** | « الوثيقة (1) (1) » (numéro de document dupliqué) ; micro-textes latins illisibles | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc01__alhala-alaslya-p-870-alhala-alm-hy-ja-p-870-kmwn-alaksda-alirjaa-img041.jpeg` |
| 42 | `Gemini_Generated_Image (31).jpeg` | 193865 | `u6` | `phase10_chapitres_19_20_2` | 2 | العمق (متر) / الامتصاص بدلالة طول الموجة — أشنة خضراء، بنية، حمراء (الوثيقتان 2 et 3) | **OK** | — | `06_U6_Photosynthese` | `phase10_chapitres_19_20_2__doc02__alamq-mtr-alamtsas-bdlala-twl-almwja-ashna-khdra-bnya-hmra-alwth-img042.jpeg` |
| 43 | `Gemini_Generated_Image (32).jpeg` | 319720 | `u6` | `phase10_chapitres_19_20_2` | 1 | دراسة الطحالب البحرية (أشنة خضراء/بنية/حمراء) | **FIX_TEXT** | « بلادير هوائية للطافية طحالب عملاقة » (suite corrompue après le terme officiel أشنة بنية) ; « كلوريلا وأولفا » / « دولس » : noms approximatifs | `00_QA_A_Corriger_IA` | `u6__phase10_chapitres_19_20_2__A_CORRIGER__doc01__drasa-althalb-albhrya-ashna-khdra-bnya-hmra-img043.jpeg` |
| 44 | `Gemini_Generated_Image (33).jpeg` | 240206 | `u6` | `phase11_chapitres_21_22_2` | — | غشاء التيلاكويد — النظامان الضوئيان et ATP سنتاز | **FIX_TEXT** | « تجميع المذاذير (Granum) » (mot inventé) ; « الحشوة (تركيز منخفض لـ H⁺ / pH منخفض) » et « تجويف التيلاكويد (تركيز مرتفع / pH مرتفع) » : pH inversés (erreur scientifique) ; « معقّد صانعة ATP » (ordre des mots) | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc00__ghsha-altylakwyd-alnzaman-aldwiyan-et-atp-sntaz-img044.jpeg` |
| 45 | `Gemini_Generated_Image (34).jpeg` | 248333 | `u6` | `phase12_chapitres_23_24` | 5 | آلية التركيب الضوئي في الصانعات الخضراء | **FIX_TEXT** | « التفاعلات الكيبر المتعمدة على الضوء (حلقة كالفن) » (mots corrompus : الكيميائية / المعتمدة) ; « حبيبة نشا » au lieu de « حبيبة نشاء » ; « مركّب عضوي (سكر) ثاني أكسيد الكربون (CO₂) » (légende amalgamée) | `00_QA_A_Corriger_IA` | `u6__phase12_chapitres_23_24__A_CORRIGER__doc05__alya-altrkyb-aldwiy-fy-alsanaat-alkhdra-img045.jpeg` |
| 46 | `Gemini_Generated_Image (35).jpeg` | 211899 | `u6` | `d2-u6-l3-calvin` | 4 | حلقة كالفن – بينسون | **FIX_TEXT** | « 1PGal (1x كربون) » au lieu de « 1PGal (1 × 3C) » ; « Temperature 37.9°C / 18.5 V / 2000K / 200A » (unités inventées) ; « بينسون » au lieu de « بنسون » | `00_QA_A_Corriger_IA` | `u6__d2-u6-l3-calvin__A_CORRIGER__doc04__hlqa-kalfn-bynswn-img046.jpeg` |
| 47 | `Gemini_Generated_Image (36).jpeg` | 141539 | `u6` | `d2-u6-l3-calvin` | 3 | الشكل (1)/(2) — شدة الإشعاع، RuDP/APG، ضوء/ظلام، % CO₂ | **FIX_TEXT** | « %1 CO₂ / %0 CO₂ » (pourcentages inversés par rendu RTL, au lieu de 1 % / 0 %) ; « الزمن (ثا) » abrégé de façon incohérente | `00_QA_A_Corriger_IA` | `u6__d2-u6-l3-calvin__A_CORRIGER__doc03__alshkl-1-2-shda-alishaaa-rudp-apg-dw-zlam-co2-img047.jpeg` |
| 48 | `Gemini_Generated_Image (37).jpeg` | 176238 | `u6` | `d2-u6-l3-calvin` | 2 | مراحل إجراء الفصل عن طريق التسجيل اللونيّ (الكروماتوغرافي) ذو البعدين | **FIX_TEXT** | « جراء الفصل » au lieu de « إجراء الفصل » ; « قلب اللّوحة 90 داتجاه عقرب باتجاه الساعة » (mot « داتجاه » inventé) ; « ذو البعدين » accord fautif (ذي البعدين) | `00_QA_A_Corriger_IA` | `u6__d2-u6-l3-calvin__A_CORRIGER__doc02__mrahl-ijra-alfsl-an-tryq-altsjyl-allwny-alkrwmatwghrafy-dhw-alba-img048.jpeg` |
| 49 | `Gemini_Generated_Image (38).jpeg` | 192089 | `u6` | `d2-u6-l3-calvin` | 1 | مخطّط تفصيلي لجهاز التجربة العلميّة / تصوير للجهاز في معمل علميّ | **FIX_TEXT** | « صورة للركب التجريبي المستعمل » au lieu de « للتركيب التجريبي » ; « مصادر ضوء متكرّرة » (terme impropre) | `00_QA_A_Corriger_IA` | `u6__d2-u6-l3-calvin__A_CORRIGER__doc01__mkht-t-tfsyly-ljhaz-altjrba-alalmy-a-tswyr-lljhaz-fy-maml-almy-img049.jpeg` |
| 50 | `Gemini_Generated_Image (39).jpeg` | 173654 | `u7` | `d2-u7-l1-mitchell-racker` | — | مخطط يوضّح آلية النظرية الكيميائية الأسموزية للعالم Peter Mitchell | **FIX_TEXT** | « فشة » (mot inventé sur le petit cartouche, au lieu de غشاء) ; « ATP صانعة (Synthase) » (ordre des mots inversé) | `00_QA_A_Corriger_IA` | `u7__d2-u7-l1-mitchell-racker__A_CORRIGER__doc00__mkhtt-ywd-h-alya-alnzrya-alkymyaiya-alasmwzya-llaalm-peter-mitch-img050.jpeg` |
| 51 | `Gemini_Generated_Image (40).jpeg` | 169010 | `u6` | `phase11_chapitres_21_22_2` | 13 | آلية التركيب الضوئي في الصانعات الخضراء | **FIX_TEXT** | « تكوين متحدّر البروتونات » au lieu de « تدرّج البروتونات » ; « NADP⁺ اختزال الكربون إلى NADPH » (erreur scientifique : c'est NADP⁺ qui est réduit) ; « معقّد ATP صانعة » (ordre des mots) | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc13__alya-altrkyb-aldwiy-fy-alsanaat-alkhdra-img051.jpeg` |
| 52 | `Gemini_Generated_Image (41).jpeg` | 183473 | `u6` | `d2-u6-l2-jagendorf` | 12 | تجربة جاغندورف — المراحل (1) à (4), pH 4 / 7 / 8, ADP+Pi → ATP | **OK** | — | `06_U6_Photosynthese` | `d2-u6-l2-jagendorf__doc12__tjrba-jaghndwrf-almrahl-1-4-ph-4-7-8-adp-pi-atp-img052.jpeg` |
| 53 | `Gemini_Generated_Image (42).jpeg` | 206956 | `u6` | `phase11_chapitres_21_22_2` | 10 | المخطط 1/2/3 — PSII, PSI, T₁, T₂, NADPH,H⁺ (schéma en Z) | **FIX_TEXT** | « ألمخط 1 / ألمخط 2 / ألمخط 3 » au lieu de « المخطط » ; « PS₆ » au lieu de « PSI » ; « 3,974 molecular / 12 231 » (micro-textes latins inventés) | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc10__almkhtt-1-2-3-psii-psi-t1-t2-nadph-h-sch-ma-en-z-img053.jpeg` |
| 54 | `Gemini_Generated_Image (43).jpeg` | 179322 | `u6` | `phase11_chapitres_21_22_2` | 9 | تأكسد صبغة مركز التفاعل (P₆₈₀ / P₇₀₀) | **OK** | — | `06_U6_Photosynthese` | `phase11_chapitres_21_22_2__doc09__taksd-sbgha-mrkz-altfaal-p680-p700-img054.jpeg` |
| 55 | `Gemini_Generated_Image (44).jpeg` | 189330 | `u6` | `phase11_chapitres_21_22_2` | 8 | تأكسد جزيئة الصبغة في مركز تفاعل PSI / PSII | **FIX_TEXT** | « كهيج نتيجة اكتساب طاقة » au lieu de « تهيّج » ; « صبغة حوائية » au lieu de « صبغة هوائية » (ه→ح) ; « الحالة المستقرة لصبغة » : libellé tronqué en bas à droite | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc08__taksd-jzyia-alsbgha-fy-mrkz-tfaal-psi-psii-img055.jpeg` |
| 56 | `Gemini_Generated_Image (45).jpeg` | 258421 | `u6` | `phase11_chapitres_21_22_2` | 7 | انتقال الطاقة بين أصباغ النظام الضوئي (5 étapes) | **FIX_TEXT** | « صبغة حوائية » répété 5× au lieu de « هوائية » ; « أصباغ حوائية » (même corruption) | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc07__antqal-altaqa-byn-asbagh-alnzam-aldwiy-5-tapes-img056.jpeg` |
| 57 | `Gemini_Generated_Image (46).jpeg` | 211717 | `u6` | `phase11_chapitres_21_22_2` | — | رسم تخطيطي مبسّط / رسم تخطيطي لآلية عمل النظام الضوئي | **FIX_TEXT** | « صبغة حوائية » (ه→ح) sur 4 légendes ; « تحرير الإلكترون (أكسد مهيّجة) » (phrase corrompue) ; deux légendes quasi identiques pour la même figure | `00_QA_A_Corriger_IA` | `u6__phase11_chapitres_21_22_2__A_CORRIGER__doc00__rsm-tkhtyty-mbs-t-rsm-tkhtyty-lalya-aml-alnzam-aldwiy-img057.jpeg` |
| 58 | `Gemini_Generated_Image (47).jpeg` | 147675 | `u6` | `d2-u6-l1-hill-ruben` | 1 | صورة توضّح ظاهرة الاستشعاع لمحلول الكلوروفيل الخام + الوثيقة (1) | **FIX_TEXT** | « كالوروفيل » au lieu de « كلوروفيل » ; « حرارة ويقاء » (mot inventé) ; « الاستشعاع / (استشعاع) » au lieu de « التألق » | `00_QA_A_Corriger_IA` | `u6__d2-u6-l1-hill-ruben__A_CORRIGER__doc01__swra-twd-h-zahra-alastshaaa-lmhlwl-alklwrwfyl-alkham-alwthyqa-1-img058.jpeg` |
| 59 | `Gemini_Generated_Image (48).jpeg` | 211204 | `u6` | `d2-u6-l1-hill-ruben` | 4 | مُعلَّق من الصانعات الخضراء في غياب CO₂ → انطلاق O₂ sous lumière | **OK** | — | `06_U6_Photosynthese` | `d2-u6-l1-hill-ruben__doc04__m-al-q-mn-alsanaat-alkhdra-fy-ghyab-co2-antlaq-o2-sous-lumi-re-img059.jpeg` |
| 60 | `Gemini_Generated_Image (49).jpeg` | 119609 | `u6` | `d2-u6-l2-jagendorf` | 3 | تركيز O₂ / ATP (ميكرومول/ل) — إضافة Pi + ADP, ظلام/ضوء/ظلام | **FIX_TEXT** | « الزمن 0j / 1j / 2j / 3j » (notation française « j » au lieu de jours en arabe) ; « إضافة Pi + ADP » (ordre inversé par rapport à ADP + Pi) | `00_QA_A_Corriger_IA` | `u6__d2-u6-l2-jagendorf__A_CORRIGER__doc03__trkyz-o2-atp-mykrwmwl-l-idafa-pi-adp-zlam-dw-zlam-img060.jpeg` |
| 61 | `Gemini_Generated_Image (50).jpeg` | 120493 | `u6` | `d2-u6-l1-hill-ruben` | 2 | المعدل النسبي للتركيب الضوئي / الامتصاص (%) بدلالة طول موجة الضوء (منحنى ١، منحنى ٢) | **OK** | — | `06_U6_Photosynthese` | `d2-u6-l1-hill-ruben__doc02__almadl-alnsby-lltrkyb-aldwiy-alamtsas-bdlala-twl-mwja-aldw-mnhna-img061.jpeg` |
| 62 | `Gemini_Generated_Image (51).jpeg` | 171688 | `u6` | `d2-u6-l1-hill-ruben` | 1 | تركيز O₂ (ميكرومول/ل) بدلالة الزمن — إضافة 0.1/0.3 مل من المستقبل | **FIX_TEXT** | « إضافة 0.3 + مل من المستقبل » (signe « + » déplacé) ; « المستقبل » (accepteur) sans précision scientifique | `00_QA_A_Corriger_IA` | `u6__d2-u6-l1-hill-ruben__A_CORRIGER__doc01__trkyz-o2-mykrwmwl-l-bdlala-alzmn-idafa-0-1-0-3-ml-mn-almstqbl-img062.jpeg` |
| 63 | `Gemini_Generated_Image (52).jpeg` | 189971 | `u6` | `phase12_chapitres_23_24_2` | 3 | مُعلَّق من الصانعات الخضراء : انطلاق O₂ / تثبيت CO₂ وتركيب السكر (الوثيقة 3) | **OK** | — | `06_U6_Photosynthese` | `phase12_chapitres_23_24_2__doc03__m-al-q-mn-alsanaat-alkhdra-antlaq-o2-tthbyt-co2-wtrkyb-alskr-alw-img063.jpeg` |
| 64 | `Gemini_Generated_Image (53).jpeg` | 268302 | `u6` | `phase11_chapitres_21_22_2` | — | غشاء التيلاكويد : PSII → نواقل الإلكترونات → PSI → إنزيم سنتاز ATP (الأشكال 2 et 3) | **OK** | — | `06_U6_Photosynthese` | `phase11_chapitres_21_22_2__doc00__ghsha-altylakwyd-psii-nwaql-alilktrwnat-psi-inzym-sntaz-atp-alas-img064.jpeg` |
| 65 | `Gemini_Generated_Image (54).jpeg` | 268586 | `u6` | `phase10_chapitres_19_20_2` | 1 | الوثيقة (1) — بناء الغرانا في الصانعة الخضراء (légende 1–8) | **FIX_TEXT** | « … الحداثية لتطور الوثيقة (1) » (titre corrompu, « الوثيقة (1) » dupliqué) ; « كيس (تيلاكويدة) » au lieu de « تيلاكويد » ; « غرانا (بذيرة) » (terme impropre) | `00_QA_A_Corriger_IA` | `u6__phase10_chapitres_19_20_2__A_CORRIGER__doc01__alwthyqa-1-bna-alghrana-fy-alsanaa-alkhdra-l-gende-1-8-img065.jpeg` |
| 66 | `Gemini_Generated_Image (55).jpeg` | 325870 | `u6` | `phase12_chapitres_23_24_2` | 3 | تركيز O₂ / CO₂ (ميكرومول/ل) بدلالة الزمن (دقائق) — ضوء / ظلام | **OK** | — | `06_U6_Photosynthese` | `phase12_chapitres_23_24_2__doc03__trkyz-o2-co2-mykrwmwl-l-bdlala-alzmn-dqaiq-dw-zlam-img066.jpeg` |
| 67 | `Gemini_Generated_Image (56).jpeg` | 225613 | `u6` | `phase10_chapitres_19_20_2` | 2 | ملاحظة نسيج خلوي وصانعة خضراء بالمجهر الضوئي/الإلكتروني (الشكلان 1 et 2) | **OK** | — | `06_U6_Photosynthese` | `phase10_chapitres_19_20_2__doc02__mlahza-nsyj-khlwy-wsanaa-khdra-balmjhr-aldwiy-alilktrwny-alshkla-img067.jpeg` |
| 68 | `Gemini_Generated_Image (57).jpeg` | 361117 | `u11` | `phase21_chapitres_41_42_2` | 2 | خريطة جيولوجية — مفتاح الرموز الجيولوجية (أوليغوسين، طباشيري، ترياس، فليش، أوفيوليت، غناس…) | **FIX_TEXT** | « غناس ومغماتيت » au lieu de « غنايس ومغماتيت » (gneiss) ; « منطقة الالتصام بين الألبوران وإفريقيا » au lieu de « الالتحام » ; « واد جن جن / تاكسة / بني خطاب » (toponymes déformés) | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42_2__A_CORRIGER__doc02__khryta-jywlwjya-mftah-alrmwz-aljywlwjya-awlyghwsyn-tbashyry-trya-img068.jpeg` |
| 69 | `Gemini_Generated_Image (58).jpeg` | 293902 | `u11` | `phase21_chapitres_41_42_2` | 1 | الوثيقة الأبوراني / الوثيقة (1) — النزوح القاري، الكتلة الإيبيرية، الكتلة الأفريقية | **FIX_TEXT** | « الأبوراني / الأبوران » au lieu de « الألبوراني / الألبوران » (ل manquante) ; « التحولات البورونربية » (mot corrompu) ; « ك. القابل الصاري / ك. القابل الكبير » au lieu de « القابل الصغير » ; « طفو الأبوران (أوروبا) » (terme impropre) | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42_2__A_CORRIGER__doc01__alwthyqa-alabwrany-alwthyqa-1-alnzwh-alqary-alktla-aliybyrya-alk-img069.jpeg` |
| 70 | `Gemini_Generated_Image (59).jpeg` | 296651 | `u9` | `phase17_chapitres_33_34` | — | مقطع في منطقة غوص : صهارة/بركان، العمق (كلم) 0–30–100, repères 1–5 | **OK** | — | `09_U9_Tectonique_Plaques` | `phase17_chapitres_33_34__doc00__mqta-fy-mntqa-ghws-shara-brkan-alamq-klm-0-30-100-rep-res-1-5-img070.jpeg` |
| 71 | `Gemini_Generated_Image (60).jpeg` | 250590 | `u11` | `phase21_chapitres_41_42_2` | — | دورة ويلسون en 5 blocs (قشرة قارية / قشرة محيطية / البرنس الليتوسفيري) | **OK** | — | `11_U11_Phenomenes_Geologiques` | `phase21_chapitres_41_42_2__doc00__dwra-wylswn-en-5-blocs-qshra-qarya-qshra-mhytya-albrns-allytwsfy-img071.jpeg` |
| 72 | `Gemini_Generated_Image (61).jpeg` | 241185 | `doublon` | `phase21_chapitres_41_42_2` | — | دورة ويلسون en 5 blocs avec libellés anglais (Pre-collision, Sea Floor Spreading, Subduction Init., Initial Rifting, Collision) | **REJECT** | doublon inférieur de l'image 71 avec légendes en anglais hors charte arabe ; étapes 2 et 3 interverties par rapport à la version arabe | `99_Enrichissement_ou_Doublons` | `99__phase21_chapitres_41_42_2__doc00__dwra-wylswn-en-5-blocs-avec-libell-s-anglais-pre-collision-sea-f-img072.jpeg` |
| 73 | `Gemini_Generated_Image (62).jpeg` | 291783 | `u11` | `d3-u11-l1-migmatite` | 2 | b – شرائح للصخرين R₁ و R₂ (بلاجيوكلا ز، بروكسون، امفيبول، كوارتز، ميكا) | **FIX_TEXT** | « شرائح للصخرين R₁ و R₁ » au lieu de « R₁ و R₂ » ; « بلاجيوكلا ز = PI » (plagioclase déformé) ; « بروكسون = Py » au lieu de « بيروكسين » ; « امفيبول = A » (hamza fautive : أمفيبول) ; « PX » dans le schéma contre « Py » dans la légende | `00_QA_A_Corriger_IA` | `u11__d3-u11-l1-migmatite__A_CORRIGER__doc02__b-shraih-llskhryn-r1-w-r2-blajywkla-z-brwkswn-amfybwl-kwartz-myk-img073.jpeg` |
| 74 | `Gemini_Generated_Image (63).jpeg` | 167949 | `u9` | `phase17_chapitres_33_34` | 1 | مقطع تكتوني : قشرة قارية/محيطية، البرنس الليتوسفيري، ماغما، مندس، بركان | **OK** | — | `09_U9_Tectonique_Plaques` | `phase17_chapitres_33_34__doc01__mqta-tktwny-qshra-qarya-mhytya-albrns-allytwsfyry-maghma-mnds-br-img074.jpeg` |
| 75 | `Gemini_Generated_Image (64).jpeg` | 192258 | `u11` | `phase21_chapitres_41_42_2` | — | الزمن = 0 / +100 / +200 / +300 مليون سنة (دورة ويلسون, 6 repères) | **OK** | — | `11_U11_Phenomenes_Geologiques` | `phase21_chapitres_41_42_2__doc00__alzmn-0-100-200-300-mlywn-sna-dwra-wylswn-6-rep-res-img075.jpeg` |
| 76 | `Gemini_Generated_Image (65).jpeg` | 231656 | `u11` | `phase21_chapitres_41_42` | — | مقطع ظهرة وسط محيطية, 1300°, repères 1–7 | **FIX_TEXT** | « 1300° » sans unité « C » (au lieu de 1300 °C) | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42__A_CORRIGER__doc00__mqta-zhra-wst-mhytya-1300-rep-res-1-7-img076.jpeg` |
| 77 | `Gemini_Generated_Image (66).jpeg` | 196290 | `u9` | `phase18_chapitres_35_36_2` | — | مقطع تكتوني : حيد، غوص، H₂O, 90 km / 700 km, repères 1–11 | **OK** | — | `09_U9_Tectonique_Plaques` | `phase18_chapitres_35_36_2__doc00__mqta-tktwny-hyd-ghws-h2o-90-km-700-km-rep-res-1-11-img077.jpeg` |
| 78 | `Gemini_Generated_Image (67).jpeg` | 204905 | `u9` | `phase18_chapitres_35_36` | — | بركان جزر / حيد وسط محيطي / بركان قاري / قوس بركاني قاري — الوشاح العلوي والأوسط والسفلي | **FIX_TEXT** | « جيد وسط محيطي » au lieu de « حيد وسط محيطي » (ح→ج) ; « صخور محوّلة منطقة التصهار » au lieu de « الانصهار » ; « Olivine » en latin (3×), « Pressure velocity (m/s) » | `00_QA_A_Corriger_IA` | `u9__phase18_chapitres_35_36__A_CORRIGER__doc00__brkan-jzr-hyd-wst-mhyty-brkan-qary-qws-brkany-qary-alwshah-alalw-img078.jpeg` |
| 79 | `Gemini_Generated_Image (68).jpeg` | 232316 | `u11` | `phase20_chapitres_39_40_2` | — | تباعد / تضاغط — المعقد الأفيوليتي, العمق (Km), légende stratigraphique | **FIX_TEXT** | « المعقد الأفيوليتي » au lieu de « المعقّد الأوفيوليتي » ; « الصخور الرسوبية السينوزوي » au lieu de « السينوزوئي » ; « قشرة قارية (قاعدة استحاتية) » (mot « استحاتية » corrompu) | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc00__tbaad-tdaght-almaqd-alafywlyty-alamq-km-l-gende-stratigraphique-img079.jpeg` |
| 80 | `Gemini_Generated_Image (69).jpeg` | 253339 | `u11` | `phase21_chapitres_41_42_2` | 5 | أعمدة الأفيوليت لمناطق عمان، الألب وتاكسانة | **FIX_TEXT** | « الأفيوليت / أفيوليت » au lieu de « الأوفيوليت » (4 occurrences) ; « بازلت وسادي راديرلاريت » (mot inventé, au lieu de راديولاريت) ; « غرقة قاعدية » au lieu de « عروق قاعدية » ; « تاكسانة » (toponyme déformé) ; « Quartz / Feldspar / Harzburgite / Lherzolites » en latin | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42_2__A_CORRIGER__doc05__aamda-alafywlyt-lmnatq-aman-alalb-wtaksana-img080.jpeg` |
| 81 | `Gemini_Generated_Image (70).jpeg` | 286968 | `u11` | `phase20_chapitres_39_40_2` | 3 | صورة لمكشف صخور الأفيوليت في واد جن جن / مكشف الفليش في منطقة تاكسانة (الوثيقتان 3 et 4) | **FIX_TEXT** | « الأفيوليت » au lieu de « الأوفيوليت » ; « واد جن جن » au lieu de « وادي جن جن » ; « تاكسانة » (toponyme déformé) ; « P-wave / S-wave » en latin | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc03__swra-lmkshf-skhwr-alafywlyt-fy-wad-jn-jn-mkshf-alflysh-fy-mntqa-img081.jpeg` |
| 82 | `Gemini_Generated_Image (71).jpeg` | 211972 | `u11` | `phase20_chapitres_39_40_2` | 2 | خريطة جيولوجية مفصّلة للمنطقة (تاكسانة, جنوب جيجل, 1/50 000) | **FIX_TEXT** | « صخور ميتامورفية مثل الألبان » (mot corrompu) ; « رواسب الميوسين ودائة الالتصام بين القارتين » (mots corrompus) ; « الالتصام » au lieu de « الالتحام » ; « Pressure velocity (m/s) » en latin | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc02__khryta-jywlwjya-mfs-la-llmntqa-taksana-jnwb-jyjl-1-50-000-img082.jpeg` |
| 83 | `Gemini_Generated_Image (72).jpeg` | 239820 | `u11` | `phase20_chapitres_39_40_2` | 1 | خريطة جيولوجية مبسّطة للقبائل الصغرى | **FIX_TEXT** | « فالق الجمهي الكبائلي » (mots corrompus) ; « تكسنة » (toponyme déformé) ; « الكبائلي / القبائل » orthographe incohérente | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc01__khryta-jywlwjya-mbs-ta-llqbail-alsghra-img083.jpeg` |
| 84 | `Gemini_Generated_Image (73).jpeg` | 348451 | `u11` | `d3-u11-l1-migmatite` | 8 | صورة لشريحة بالمجهر الاستقطابي تبين معدن الغرونا – Gt – (كالسيت، فلدسبار، مايكا) | **FIX_TEXT** | « المجهر الاستقطابي » au lieu de « المجهر المستقطب » ; « الغرونا » au lieu de « الغرونات/الغارنيت » (grenat) ; « فلدسبار » (transcription approximative de feldspath) | `00_QA_A_Corriger_IA` | `u11__d3-u11-l1-migmatite__A_CORRIGER__doc08__swra-lshryha-balmjhr-alastqtaby-tbyn-madn-alghrwna-gt-kalsyt-fld-img084.jpeg` |
| 85 | `Gemini_Generated_Image (74).jpeg` | 328502 | `u11` | `d3-u11-l1-migmatite` | 6 | صورة لمكشف صخور ناتجة عن التصادم القاري / صورة لعينة صخر المغماتيت (الوثيقتان 6 et 7) | **FIX_TEXT** | « المغماتيت » au lieu de « الميغماتيت » | `00_QA_A_Corriger_IA` | `u11__d3-u11-l1-migmatite__A_CORRIGER__doc06__swra-lmkshf-skhwr-natja-an-altsadm-alqary-swra-layna-skhr-almghm-img085.jpeg` |
| 86 | `Gemini_Generated_Image (75).jpeg` | 351593 | `u11` | `d3-u11-l1-migmatite` | 6 | صورة لمكشف صخور ناتجة عن التصادم / صورة لعينة صخر المغماتيت, Q·Pll, BI·Amp, 10 mm | **FIX_TEXT** | « المغماتيت » au lieu de « الميغماتيت » ; « بيوتست » au lieu de « بيوتيت » ; « SPECIMEN ANALYSIS / DEFORMATION STUDY » en latin | `00_QA_A_Corriger_IA` | `u11__d3-u11-l1-migmatite__A_CORRIGER__doc06__swra-lmkshf-skhwr-natja-an-altsadm-swra-layna-skhr-almghmatyt-q-img086.jpeg` |
| 87 | `Gemini_Generated_Image (76).jpeg` | 310013 | `u11` | `d3-u11-l1-migmatite` | 6 | الوثيقة (7): عينة صخرية لغنايس / دراسة تحولية لصخور غنايس وأصولها | **FIX_TEXT** | « دراسة تحولية » au lieu de « دراسة تحوّلية » (orthograpre) ; « outrop » au lieu de « outcrop » (mot latin tronqué) ; « outcrop » en latin au lieu de « مكشف » | `00_QA_A_Corriger_IA` | `u11__d3-u11-l1-migmatite__A_CORRIGER__doc06__alwthyqa-7-ayna-skhrya-lghnays-drasa-thwlya-lskhwr-ghnays-waswlh-img087.jpeg` |
| 88 | `Gemini_Generated_Image (77).jpeg` | 241244 | `u11` | `phase20_chapitres_39_40_2` | 1 | نمذجة التصادم القاري : قبل / خلال / نهاية التشوه (repères س، ب، ج، د) | **FIX_TEXT** | « الوثيقة (5) » en même temps que les panneaux (1)(2)(3) (numérotation incohérente) | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc01__nmdhja-altsadm-alqary-qbl-khlal-nhaya-altshwh-rep-res-s-b-j-d-img088.jpeg` |
| 89 | `Gemini_Generated_Image (78).jpeg` | 225833 | `u11` | `phase20_chapitres_39_40_2` | 4 | رسم تخطيطي لمقطع في السلسلة المغاربية (المجال أ، المجال ب, فالق الجمهوري القبائلي) | **FIX_TEXT** | « الفالق الجمهوري القبائلي » au lieu de « الفالق الجبهوي القبائلي » ; « الوكغرانيت / رغائناس / شيبست / أوفيوليت » (termes déformés) ; « shift / كمبرو أوردوفيسي » en transcription latine ; « تكسنة » (toponyme déformé) | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc04__rsm-tkhtyty-lmqta-fy-alslsla-almgharbya-almjal-a-almjal-b-falq-a-img089.jpeg` |
| 90 | `Gemini_Generated_Image (79).jpeg` | 314777 | `u11` | `phase20_chapitres_39_40_2` | 1 | مكشف لمقطع في سلسلة جبلية ناشئة — صورة لتضاريس مشوهة — نموذج للفالق العكسي — خط تفسيري (أ-2, ب-2) | **FIX_TEXT** | « نموذج للفالق العكسي » (le schéma montre un décrochement, pas un chevauchement) ; « فالق عكسي » (flèches latérales) mal nommé ; « GEOLOGICAL INSTITUTE » en latin | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc01__mkshf-lmqta-fy-slsla-jblya-nashia-swra-ltdarys-mshwha-nmwdhj-llf-img090.jpeg` |
| 91 | `Gemini_Generated_Image (80).jpeg` | 307083 | `u11` | `phase20_chapitres_39_40_2` | — | خريطة بنيوية للمغرب العربي : الأطلس الكبير/الصغير/المتوسط, الألبوران, قارة الأورون | **FIX_TEXT** | « قارة الأورون مع إفريقيا » au lieu de « قارة الألبوران » ; « الأورون » (mot corrompu) ; « منطقة التحام لوح ميكرو » (tournure fautive) ; « جبهة الصخور المغتربة » (terme corrompu) | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc00__khryta-bnywya-llmghrb-alarby-alatls-alkbyr-alsghyr-almtwst-alalb-img091.jpeg` |
| 92 | `Gemini_Generated_Image (81).jpeg` | 265047 | `u11` | `phase20_chapitres_39_40_2` | 4 | رسم تخطيطي لقطع جيولوجي يمر عبر القبائل الصغرى في الوقت الحالي (4-5-6) | **FIX_TEXT** | « التحليل الجيوكتي للقبائل » (mot corrompu) ; « المابور البابور / حوض تيشك الصخور المغتربة / أعصاب العليا » (mots corrompus) ; « القاعدة الاستحالية الكلسية » (mot corrompu) | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc04__rsm-tkhtyty-lqta-jywlwjy-ymr-abr-alqbail-alsghra-fy-alwqt-alhaly-img092.jpeg` |
| 93 | `Gemini_Generated_Image (82).jpeg` | 234425 | `u11` | `phase20_chapitres_39_40_2` | 1 | مراحل تشكل السلسلة المغربية : 150 / 100 / 45 مليون سنة | **FIX_TEXT** | « %100 مراحل تشكل » (% au lieu de 100 %, ordre inversé) ; « الألبوران / أدريا » orthographe acceptable mais « إفريقيا »/« أوروبا » désaccord cartographique ; « 1000Km » sans espace | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc01__mrahl-tshkl-alslsla-almghrbya-150-100-45-mlywn-sna-img093.jpeg` |
| 94 | `Gemini_Generated_Image (83).jpeg` | 324535 | `u9` | `phase17_chapitres_33_34` | — | مقطع غوص : قشرة محيطية متمهدة, 600°C/1000°C, H₂O, البرنس الأستينوسفيري, repères 1–7 | **FIX_TEXT** | « متمهدة » au lieu de « متهدّلة/مغمورة » (mot corrompu) ; « القشرة الشيتابية » (mot corrompu, au lieu de الشستية) ; « الأستينوسفيري » au lieu de « الأستينوسفيري » (transcription du anglais, toléré) ; « المجال المغتربي » (mot corrompu) | `00_QA_A_Corriger_IA` | `u9__phase17_chapitres_33_34__A_CORRIGER__doc00__mqta-ghws-qshra-mhytya-mtmhda-600-c-1000-c-h2o-albrns-alastynwsf-img094.jpeg` |
| 95 | `Gemini_Generated_Image (84).jpeg` | 178949 | `u11` | `phase17_chapitres_33_34_2` | 16 | مخطط يبين تطور صخر الغابرو خلال غوص الصفيحة المحيطية (الوثيقة 16) | **FIX_TEXT** | « مسار صخر الغابرو امحيطي عملية الغوص » au lieu de « مسار صخر الغابرو المحيطي أثناء عملية الغوص » ; « مجال غير محقق في الطبيعة » au lieu de « مجال غير محقّق في الطبيعة » ; « P 000 » / « T 000 » (valeurs numériques remplacées par des zéros) | `00_QA_A_Corriger_IA` | `u11__phase17_chapitres_33_34_2__A_CORRIGER__doc16__mkhtt-ybyn-ttwr-skhr-alghabrw-khlal-ghws-alsfyha-almhytya-alwthy-img095.jpeg` |
| 96 | `Gemini_Generated_Image (85).jpeg` | 358849 | `u11` | `phase17_chapitres_33_34_2` | 13 | مخطط تفسيري لشريحة الميتاغابرو تحت المجهر المستقطب (الوثيقة 13) — صور لشرائح الشست الأزرق والإكلوجيت (الوثيقتان 14 و15) | **FIX_TEXT** | « METAGABRO ANALYSIS » au lieu de « METAGABBRO ANALYSIS » (B manquant) ; « فلسيات بلاجيوكلا ز - Pl » au lieu de « فلدسبات بلاجيوكلا ز » ; « غلو كوفان - Gl » au lieu de « غلو كوفانيت » ; « غرونا - Gr » au lieu de « غرونات » ; « إيدوت - Ep » au lieu de « إيبيدوت » ; « الكوارتز + Q » (redondance arabe/latine) | `00_QA_A_Corriger_IA` | `u11__phase17_chapitres_33_34_2__A_CORRIGER__doc13__mkhtt-tfsyry-lshryha-almytaghabrw-tht-almjhr-almstqtb-alwthyqa-1-img096.jpeg` |
| 97 | `Gemini_Generated_Image (86).jpeg` | 345225 | `u11` | `phase17_chapitres_33_34_2` | 12 | تمثيل تخطيطي لمقطع في منطقة غوص يبين مسار الماء (الوثيقة 12) | **FIX_TEXT** | « T 000 °C » (température remplacée par des zéros) ; « مندس غرانونديورتي » au lieu de « مندس غرانوديوريتي » ; « غرقة ماغماتية » au lieu de « غرفة ماغماتية » | `00_QA_A_Corriger_IA` | `u11__phase17_chapitres_33_34_2__A_CORRIGER__doc12__tmthyl-tkhtyty-lmqta-fy-mntqa-ghws-ybyn-msar-alma-alwthyqa-12-img097.jpeg` |
| 98 | `Gemini_Generated_Image (87).jpeg` | 147771 | `u11` | `phase17_chapitres_33_34_2` | 11 | تمثيل تخطيطي لمنطقة غوص (الوثيقة 11) — لوح محيطي / لوح قاري / نطاق الانصهار P1 | **OK** | — | `11_U11_Phenomenes_Geologiques` | `phase17_chapitres_33_34_2__doc11__tmthyl-tkhtyty-lmntqa-ghws-alwthyqa-11-lwh-mhyty-lwh-qary-ntaq-a-img098.jpeg` |
| 99 | `Gemini_Generated_Image (88).jpeg` | 353788 | `u11` | `phase17_chapitres_33_34_2` | 10 | منحنيات تبين بداية انصهار البريدويتيت في ظروف فيزيائية وكيميائية مختلفة (الوثيقة 10) | **FIX_TEXT** | « البريدويتيت » au lieu de « البيريدوتيت » (3 occurrences) ; « البريدويتيت الممبه » au lieu de « البيريدوتيت المميّه » ; « Solidus » en latin (2 occurrences) au lieu de « منحنى بداية الانصهار » ; « الضغط (K bar) » au lieu de « الضغط (kbar) » | `00_QA_A_Corriger_IA` | `u11__phase17_chapitres_33_34_2__A_CORRIGER__doc10__mnhnyat-tbyn-bdaya-anshar-albrydwytyt-fy-zrwf-fyzyaiya-wkymyaiya-img099.jpeg` |
| 100 | `Gemini_Generated_Image (89).jpeg` | 522996 | `u9` | `phase16_chapitres_31_32` | 8 | خريطة توزع الزلازل في العالم بين 1960 و 2007 (الوثيقة 8) — خريطة تبين العلاقة بين توزع الزلازل وحدود الصفائح التكتونية (الوثيقة 9) | **FIX_TEXT** | « (برنامج Seismic eruption) » au lieu de « Seismic Explorer » (programme corrompu) ; « الوللال 6364 » au lieu de « الزلازل 6364 » ; « لوح مازمة » au lieu de « لوح نازكا » ; « لوح الأمريكي الشمالية / لوح الأمريكي الجنوبية » au lieu de « لوح أمريكا الشمالية / لوح أمريكا الجنوبية » | `00_QA_A_Corriger_IA` | `u9__phase16_chapitres_31_32__A_CORRIGER__doc08__khryta-twza-alzlazl-fy-alaalm-byn-1960-w-2007-alwthyqa-8-khryta-img100.jpeg` |
| 101 | `Gemini_Generated_Image (90).jpeg` | 327863 | `u9` | `phase17_chapitres_33_34` | 4 | توزع البراكين على الحافة الغربية لأمريكا الجنوبية (الوثيقة 4) — بركان ثائر (الوثيقة 5) — خريطة التضاريس الجيولوجية لمنطقتي اليابان والفلبين (الوثيقة 6) — بركان نشط بالفلبين (الوثيقة 7) | **FIX_TEXT** | « المحيط الهادي » au lieu de « المحيط الهادئ » ; « المركز السطحي للزلازل » au lieu de « المراكز السطحية للزلازل » ; « خريطة التضاريس الجيولوجية لمنطقتي اليابان والفلبين. المركز السطحي للزلازل » (phrase nominale incomplète) | `00_QA_A_Corriger_IA` | `u9__phase17_chapitres_33_34__A_CORRIGER__doc04__twza-albrakyn-ala-alhafa-alghrbya-lamryka-aljnwbya-alwthyqa-4-br-img101.jpeg` |
| 102 | `Gemini_Generated_Image (91).jpeg` | 224992 | `u9` | `phase17_chapitres_33_34` | 3 | تمثيل ثلاثي الأبعاد يبين توزيع التضاريس والزلازل على الحافة الغربية لقارة أمريكا الجنوبية (الوثيقة 3) | **OK** | — | `09_U9_Tectonique_Plaques` | `phase17_chapitres_33_34__doc03__tmthyl-thlathy-alabaad-ybyn-twzya-altdarys-walzlazl-ala-alhafa-a-img102.jpeg` |
| 103 | `Gemini_Generated_Image (92).jpeg` | 179317 | `u9` | `phase17_chapitres_33_34` | 2 | خريطة توزيع المراكز السطحية للزلازل على طول مستوى صفيحة أمريكا الجنوبية (الوثيقة 2) | **FIX_TEXT** | « على طول مستوى صفيحة أمريكا الجنوبية » au lieu de « على طول مستوى غوص الصفيحة » ; « خط عرض 22 جنوباً » au lieu de « وعند خط عرض 22 جنوباً » ; « المسافة (Km) » en légende au lieu de « العمق (Km) » | `00_QA_A_Corriger_IA` | `u9__phase17_chapitres_33_34__A_CORRIGER__doc02__khryta-twzya-almrakz-alsthya-llzlazl-ala-twl-mstwa-sfyha-amryka-img103.jpeg` |
| 104 | `Gemini_Generated_Image (93).jpeg` | 236738 | `u9` | `phase17_chapitres_33_34` | 1 | رسم تخطيطي لمنطقة الغوص (الوثيقة 1) | **FIX_TEXT** | « المجال الحرارية » au lieu de « المجال الحراري » ; légende anglaise microscopique illisible en bas à gauche (texte IA non arabe) | `00_QA_A_Corriger_IA` | `u9__phase17_chapitres_33_34__A_CORRIGER__doc01__rsm-tkhtyty-lmntqa-alghws-alwthyqa-1-img104.jpeg` |
| 105 | `Gemini_Generated_Image (94).jpeg` | 522996 | `doublon` | `phase16_chapitres_31_32` | 8 | نسخة مكررة طبق الأصل : خريطة توزع الزلازل في العالم بين 1960 و 2007 (الوثيقة 8) وخريطة العلاقة بين الزلازل وحدود الصفائح (الوثيقة 9) | **REJECT** | doublon exact MD5 71a70f0515782a01df941cdd28e50e48 de l'image 100 (Gemini_Generated_Image (89).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | `99_Enrichissement_ou_Doublons` | `99__phase16_chapitres_31_32__doc08__nskha-mkrra-tbq-alasl-khryta-twza-alzlazl-fy-alaalm-byn-1960-w-2-img105.jpeg` |
| 106 | `Gemini_Generated_Image (95).jpeg` | 327863 | `doublon` | `phase17_chapitres_33_34` | 4 | نسخة مكررة طبق الأصل : توزع البراكين على الحافة الغربية لأمريكا الجنوبية (الوثيقة 4) وبركان ثائر (الوثيقة 5) وخريطة التضاريس الجيولوجية لمنطقتي اليابان والفلبين (الوثيقة 6) وبركان نشط بالفلبين (الوثيقة 7) | **REJECT** | doublon exact MD5 6d3c95ed2b57af29ae793e318b2db63f de l'image 101 (Gemini_Generated_Image (90).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | `99_Enrichissement_ou_Doublons` | `99__phase17_chapitres_33_34__doc04__nskha-mkrra-tbq-alasl-twza-albrakyn-ala-alhafa-alghrbya-lamryka-img106.jpeg` |
| 107 | `Gemini_Generated_Image (96).jpeg` | 224992 | `doublon` | `phase17_chapitres_33_34` | 3 | نسخة مكررة طبق الأصل : تمثيل ثلاثي الأبعاد يبين توزيع التضاريس والزلازل على الحافة الغربية لقارة أمريكا الجنوبية (الوثيقة 3) | **REJECT** | doublon exact MD5 5773cd549afb44e57b39cebe1067e3b9 de l'image 102 (Gemini_Generated_Image (91).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | `99_Enrichissement_ou_Doublons` | `99__phase17_chapitres_33_34__doc03__nskha-mkrra-tbq-alasl-tmthyl-thlathy-alabaad-ybyn-twzya-altdarys-img107.jpeg` |
| 108 | `Gemini_Generated_Image (97).jpeg` | 179317 | `doublon` | `phase17_chapitres_33_34` | 2 | نسخة مكررة طبق الأصل : خريطة توزيع المراكز السطحية للزلازل على طول مستوى صفيحة أمريكا الجنوبية (الوثيقة 2) | **REJECT** | doublon exact MD5 3f60cb416a33839f02bca7b65fe5a943 de l'image 103 (Gemini_Generated_Image (92).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | `99_Enrichissement_ou_Doublons` | `99__phase17_chapitres_33_34__doc02__nskha-mkrra-tbq-alasl-khryta-twzya-almrakz-alsthya-llzlazl-ala-t-img108.jpeg` |
| 109 | `Gemini_Generated_Image (98).jpeg` | 236738 | `doublon` | `phase17_chapitres_33_34` | 1 | نسخة مكررة طبق الأصل : رسم تخطيطي لمنطقة الغوص (الوثيقة 1) | **REJECT** | doublon exact MD5 0f87e24dbacfeec2d2ace9af40c3ef97 de l'image 104 (Gemini_Generated_Image (93).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | `99_Enrichissement_ou_Doublons` | `99__phase17_chapitres_33_34__doc01__nskha-mkrra-tbq-alasl-rsm-tkhtyty-lmntqa-alghws-alwthyqa-1-img109.jpeg` |
| 110 | `Gemini_Generated_Image (99).jpeg` | 184667 | `u11` | `phase20_chapitres_39_40_2` | 16 | نموذج يمثل المرحلة التبا للقشرة الأرضية (الوثيقة 16) | **FIX_TEXT** | « المرحلة التبا » (mot tronqué, au lieu de « المرحلة التباعدية » ou « مراحل التباعد ») | `00_QA_A_Corriger_IA` | `u11__phase20_chapitres_39_40_2__A_CORRIGER__doc16__nmwdhj-ymthl-almrhla-altba-llqshra-alardya-alwthyqa-16-img110.jpeg` |
| 111 | `Gemini_Generated_Image (100).jpeg` | 298713 | `u11` | `phase21_chapitres_41_42` | 13 | صور جوية لمنطقة البحر الأحمر والرفت الإفريقي (الوثيقة 13) — المرحلة الأولى من بداية الخسف (الوثيقة 14) — رسم تخطيطي يمثل الوضعية الحالية للخسف الإفريقي (الوثيقة 15) | **FIX_TEXT** | « القشرة الخيطية » au lieu de « القشرة المحيطية » ; « الرفت (الحسم) » (mot corrompu, au lieu de « الرفت (الحوض) » ou « الخسف ») ; « صغير » au lieu de « صهير » ; « الخسف » / « الرفت » employés indifféremment pour le même phénomène ; « 1300°C / 1350°C / 1400°C » sans espace avant °C | `00_QA_A_Corriger_IA` | `u11__phase21_chapitres_41_42__A_CORRIGER__doc13__swr-jwya-lmntqa-albhr-alahmr-walrft-alifryqy-alwthyqa-13-almrhla-img111.jpeg` |

## 4. Priorité des défauts IA à corriger

**238 libellés de défaut distincts** relevés sur les 80 images `FIX_TEXT`. Priorité 1 = erroneous scientific values / formules / safety; priorité 2 = libellés les plus fréquents.

### Priorité 1 — erreurs bloquantes (à corriger avant toute intégration)

| Défaut exact | Occurrences |
|---|---:|
| « T 000 °C » (température remplacée par des zéros) | 1 |
| « P 000 » / « T 000 » (valeurs numériques remplacées par des zéros) | 1 |
| « مندس غرانونديورتي » au lieu de « مندس غرانوديوريتي » | 1 |
| « NADP⁺ اختزال الكربون إلى NADPH » (erreur scientifique : c'est NADP⁺ qui est réduit) | 1 |
| « الحشوة (تركيز منخفض لـ H⁺ / pH منخفض) » et « تجويف التيلاكويد (تركيز مرتفع / pH مرتفع) » : pH inversés (erreur scientifique) | 1 |
| « %100 مراحل تشكل » (% au lieu de 100 %, ordre inversé) | 1 |
| formules chimiques corrompues « غلوكوز CH₁₂N₂O₅ 17 C », « ماء C₆H₁₂O₆ 103 C », « حمض البيروفيك H₂O₄ 10 C » | 1 |
| « Temperature 37.9°C / 18.5 V / 2000K / 200A » (unités inventées) | 1 |
| « %1 CO₂ / %0 CO₂ » (pourcentages inversés par rendu RTL, au lieu de 1 % / 0 %) | 1 |
| « PS₆ » au lieu de « PSI » | 1 |
| « بلادير هوائية للطافية طحالب عملاقة » (suite corrompue après le terme officiel أشنة بنية) | 1 |
| « القشرة الخيطية » au lieu de « القشرة المحيطية » | 1 |
| « صغير » au lieu de « صهير » | 1 |
| « ك. القابل الصاري / ك. القابل الكبير » au lieu de « القابل الصغير » | 1 |
| « البريدويتيت » au lieu de « البيريدوتيت » (3 occurrences) | 1 |
| « البريدويتيت الممبه » au lieu de « البيريدوتيت المميّه » | 1 |
| « METAGABRO ANALYSIS » au lieu de « METAGABBRO ANALYSIS » (B manquant) | 1 |
| « (برنامج Seismic eruption) » au lieu de « Seismic Explorer » (programme corrompu) | 1 |
| « المرحلة التبا » (mot tronqué, au lieu de « المرحلة التباعدية » ou « مراحل التباعد ») | 1 |

### Priorité 2 — défauts les plus fréquents (tous libellés confondus)

| Défaut exact | Occurrences |
|---|---:|
| micro-textes latins illisibles | 2 |
| micro-textes latins illisibles en fond | 2 |
| « المغماتيت » au lieu de « الميغماتيت » | 2 |
| « تاكسانة » (toponyme déformé) | 2 |
| « تكسنة » (toponyme déformé) | 2 |
| « متراكات البروتين » (mot corrompu) | 2 |
| (Gp) au lieu de (GPa) | 1 |
| afficheurs inversés « T : 20°C / 50°C / 80°C » rendus « 20°C : T » | 1 |
| aucun numéro de document, image d'appareil générique hors programme | 1 |
| cellule dessinée en globule rouge biconcave au lieu d'une membrane d'Halobacterium (erreur scientifique) | 1 |
| deux légendes quasi identiques pour la même figure | 1 |
| doublon exact MD5 0f87e24dbacfeec2d2ace9af40c3ef97 de l'image 104 (Gemini_Generated_Image (93).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | 1 |
| doublon exact MD5 3f60cb416a33839f02bca7b65fe5a943 de l'image 103 (Gemini_Generated_Image (92).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | 1 |
| doublon exact MD5 5773cd549afb44e57b39cebe1067e3b9 de l'image 102 (Gemini_Generated_Image (91).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | 1 |
| doublon exact MD5 6d3c95ed2b57af29ae793e318b2db63f de l'image 101 (Gemini_Generated_Image (90).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | 1 |
| doublon exact MD5 71a70f0515782a01df941cdd28e50e48 de l'image 100 (Gemini_Generated_Image (89).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons | 1 |
| doublon inférieur de l'image 71 avec légendes en anglais hors charte arabe | 1 |
| formules chimiques corrompues « غلوكوز CH₁₂N₂O₅ 17 C », « ماء C₆H₁₂O₆ 103 C », « حمض البيروفيك H₂O₄ 10 C » | 1 |
| libellé « البكتيريا (الهوائية) » mal accordé | 1 |
| libellés d'interface parasites « أسماء T », « مختبر التحاليل المقدمة » | 1 |
| libellés « CO₂ / 0,1 », « C1.250 », « C25,85 » parasites | 1 |
| légende anglaise microscopique illisible en bas à gauche (texte IA non arabe) | 1 |
| micro-légende « H⁺ NO ETC H⁺ AFO » illisible | 1 |
| micro-texte latin illisible/inventé dans les encadrés | 1 |
| micro-textes latins illisibles dans les panneaux | 1 |
| micro-textes latins illisibles dans les panneaux de gauche | 1 |
| micro-textes latins illisibles en fond de graphique | 1 |
| micro-textes latins illisibles sur le graphique | 1 |
| micro-textes latins illisibles sur les axes | 1 |
| numéros de cases 1–8 partiellement incohérents | 1 |
| référence latine corrompue « *Microreferences (Mam.6u00, 28, 41) » | 1 |
| texte d'interface arabe illisible/corrompu, chiffres « 1.000 5.000 » sans unité | 1 |
| texte latin corrompu « مؤسسة البحاث … Crystallization data » | 1 |
| texte latin inventé « Central Text flawlessly flawed flaws … enogicall » | 1 |
| texte latin inventé « energy Callout logically flaw logical condition flawlessly … » | 1 |
| texte latin inventé « flaws re-typed logic flaw flawlessly condition perfectly … » | 1 |
| « %1 CO₂ / %0 CO₂ » (pourcentages inversés par rendu RTL, au lieu de 1 % / 0 %) | 1 |
| « %100 مراحل تشكل » (% au lieu de 100 %, ordre inversé) | 1 |
| « (CO₂) CO₂ » redondant | 1 |
| « (برنامج Seismic eruption) » au lieu de « Seismic Explorer » (programme corrompu) | 1 |
| « (مقلوبة - مقلوبة) » répété | 1 |
| « 1000Km » sans espace | 1 |
| « 1300° » sans unité « C » (au lieu de 1300 °C) | 1 |
| « 1300°C / 1350°C / 1400°C » sans espace avant °C | 1 |
| « 1PGal (1x كربون) » au lieu de « 1PGal (1 × 3C) » | 1 |
| « 3,974 molecular / 12 231 » (micro-textes latins inventés) | 1 |
| « ADN ميتوكندري / ريبوزومات ميتوكندري » (adjectif sans ة) | 1 |
| « ATP صانعة (Synthase) » (ordre des mots inversé) | 1 |
| « ATP صانعة معقّد » (ordre des mots inversé) | 1 |
| « Adenosine Tri Phosphate » en trois mots au lieu de Adenosine Triphosphate | 1 |
| « Air Quality Data » / « Particulate Count » / « Storage Temp Log » : libellés latins hors sujet | 1 |
| « Citric Acid Cycle » et micro-textes latins parasites | 1 |
| « DNP الـ » (ordre des mots inversé) | 1 |
| « GEOLOGICAL INSTITUTE » en latin | 1 |
| « Glentilling Mapplesly mapped » (latin inventé) | 1 |
| « METAGABRO ANALYSIS » au lieu de « METAGABBRO ANALYSIS » (B manquant) | 1 |
| « NADH+H » sans exposant « + » | 1 |
| « NADP⁺ اختزال الكربون إلى NADPH » (erreur scientifique : c'est NADP⁺ qui est réduit) | 1 |
| « Olivine » en latin (3×), « Pressure velocity (m/s) » | 1 |
| « P 000 » / « T 000 » (valeurs numériques remplacées par des zéros) | 1 |

### Images `REJECT` (8) — motifs

| N° | Nom Drive | Motif |
|---:|---|---|
| 18 | `Gemini_Generated_Image (8).jpeg` | cellule dessinée en globule rouge biconcave au lieu d'une membrane d'Halobacterium (erreur scientifique) ; « بكتيريورودوبسين » mal orthographié ; micro-textes latins illisibles |
| 33 | `Gemini_Generated_Image (22).jpeg` | texte d'interface arabe illisible/corrompu, chiffres « 1.000 5.000 » sans unité ; aucun numéro de document, image d'appareil générique hors programme |
| 72 | `Gemini_Generated_Image (61).jpeg` | doublon inférieur de l'image 71 avec légendes en anglais hors charte arabe ; étapes 2 et 3 interverties par rapport à la version arabe |
| 105 | `Gemini_Generated_Image (94).jpeg` | doublon exact MD5 71a70f0515782a01df941cdd28e50e48 de l'image 100 (Gemini_Generated_Image (89).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons |
| 106 | `Gemini_Generated_Image (95).jpeg` | doublon exact MD5 6d3c95ed2b57af29ae793e318b2db63f de l'image 101 (Gemini_Generated_Image (90).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons |
| 107 | `Gemini_Generated_Image (96).jpeg` | doublon exact MD5 5773cd549afb44e57b39cebe1067e3b9 de l'image 102 (Gemini_Generated_Image (91).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons |
| 108 | `Gemini_Generated_Image (97).jpeg` | doublon exact MD5 3f60cb416a33839f02bca7b65fe5a943 de l'image 103 (Gemini_Generated_Image (92).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons |
| 109 | `Gemini_Generated_Image (98).jpeg` | doublon exact MD5 0f87e24dbacfeec2d2ace9af40c3ef97 de l'image 104 (Gemini_Generated_Image (93).jpeg) — exemplaire surnuméraire à classer en 99_Enrichissement_ou_Doublons |

## 5. Doublons exacts (MD5)

| Original conservé | Copie surnuméraire | MD5 |
|---:|---:|---|
| img100 — `Gemini_Generated_Image (89).jpeg` | img105 — `Gemini_Generated_Image (94).jpeg` | `71a70f0515782a01df941cdd28e50e48` |
| img101 — `Gemini_Generated_Image (90).jpeg` | img106 — `Gemini_Generated_Image (95).jpeg` | `6d3c95ed2b57af29ae793e318b2db63f` |
| img102 — `Gemini_Generated_Image (91).jpeg` | img107 — `Gemini_Generated_Image (96).jpeg` | `5773cd549afb44e57b39cebe1067e3b9` |
| img103 — `Gemini_Generated_Image (92).jpeg` | img108 — `Gemini_Generated_Image (97).jpeg` | `3f60cb416a33839f02bca7b65fe5a943` |
| img104 — `Gemini_Generated_Image (93).jpeg` | img109 — `Gemini_Generated_Image (98).jpeg` | `0f87e24dbacfeec2d2ace9af40c3ef97` |

## 6. Règles appliquées / arrêt

- Verdict unique par image : `OK` (propre), `FIX_TEXT` (bon visuellement mais artefact IA listé), `REJECT` (hors programme / illisible / doublon inférieur / scientifiquement faux).
- `OK` → dossier unité `01_U1_…` à `11_U11_…`, nom `<lessonId>__doc<NN>__<slug>.jpeg`.
- `FIX_TEXT` → `00_QA_A_Corriger_IA`, nom `<uniteId>__<lessonId>__A_CORRIGER__doc<NN>__<slug>.jpeg`.
- `REJECT`, `enrichissement` (`phase22_chapitres_43_44*`) et `doublon` → `99_Enrichissement_ou_Doublons`.
- Le mapping ancien nom → nouveau nom est conservé dans `originalName` / `proposedName` du manifeste JSON.
- **Aucune image supprimée, aucun `reviewed: true`, aucun `src/` touché, aucun commit.** L’écriture Drive de l’Étape 2 est limitée aux 13 créations de dossiers et aux 111 déplacements/renommages.

> **GO reçu pour l’Étape 2.** Les 13 sous-dossiers et les 111 déplacements/renommages sont exécutés d’après ce manifeste ; le bilan vérifié figure en section 7.

## 7. Bilan vérifié de l’Étape 2 (Google Drive)

Vérification effectuée le 26/11/2026 après exécution, par `list_files` sur la racine `1SbXK8wlKqICb-X7mu3tYt5jeR0O4cD_L` et sur chacun des 13 sous-dossiers (`mimeType != 'application/vnd.google-apps.folder' and trashed = false`, puis contrôle du type `image/jpeg`).

| Dossier cible | Fichiers déplacés / renommés |
|---|---:|
| `00_QA_A_Corriger_IA` | 76 |
| `01_U1_Synthese_Proteines` | 0 |
| `02_U2_Structure_Fonction` | 0 |
| `03_U3_Enzymes` | 0 |
| `04_U4_Immunite` | 0 |
| `05_U5_Systeme_Nerveux` | 0 |
| `06_U6_Photosynthese` | 9 |
| `07_U7_Respiration_Fermentation` | 2 |
| `08_U8_Bilan_Energetique` | 2 |
| `09_U9_Tectonique_Plaques` | 4 |
| `10_U10_Structure_Terre` | 0 |
| `11_U11_Phenomenes_Geologiques` | 4 |
| `99_Enrichissement_ou_Doublons` | 14 |
| **Total** | **111** |

Somme contrôlée : `76 + 9 + 2 + 2 + 4 + 4 + 14 = 111 / 111`.

- Racine source : **0** fichier image restant directement à la racine ; **13** sous-dossiers exactement, sans doublon de dossier.
- Les **111** objets vérifiés sont tous de type `image/jpeg`, avec les noms `proposedName` du manifeste ; volume total inchangé : **26 152 748 octets / 24,94 Mo**.
- Répartition QA après correction du faux positif `أشنة` / `أشنة خضراء` : **23 `OK`**, **80 `FIX_TEXT`**, **8 `REJECT`**. L’image 42, dont le seul défaut était ce faux positif, a bien été repassée `OK` vers `06_U6_Photosynthese` ; les images 43 et 49 restent `FIX_TEXT` pour leurs autres défauts réels.
- **0 suppression Drive**, **0 modification de `src/`**, **0 `reviewed: true`**, **0 commit**. Le mapping `originalName` → `proposedName` de `plans/inventaire-images-livre.json` conserve la trace de chaque ancien nom.

