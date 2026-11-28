-- ──────────────────────────────────────────────────────────────────────────────
-- استعلامات المطوّر — بوصلة العلوم Lite
-- يُنسخ كل استعلام في Supabase Studio (SQL Editor) ويُعدَّل حسب الحاجة.
-- الجداول: public.eleves (المرحلة 1، انظر supabase/schema.sql)
--         و kunz_sync_prive.profils (المرحلة 2، المزامنة الموثّقة)
-- ──────────────────────────────────────────────────────────────────────────────

-- 1) كل التلاميذ — آخر تحديث أولًا
select email, coalesce(nom, '') as nom, wilaya, daira, niveau, xp,
       lecons_terminees, drills_faits, reponses_justes, reponses_fausses,
       minutes_totales, jours_activite, generation, maj
from public.eleves
order by maj desc
limit 200;

-- 2) الأكثر تقدّمًا (نقاط الخبرة)
select email, coalesce(nom, '') as nom, niveau, xp, lecons_terminees, drills_faits
from public.eleves
order by xp desc
limit 20;

-- 3) التوزيع حسب الولاية
select wilaya,
       count(*)                       as تلاميذ,
       round(avg(xp))                 as "متوسط XP",
       round(avg(lecons_terminees), 1) as "متوسط الدروس",
       count(*) filter (where maj > now() - interval '7 days') as "نشطون هذا الأسبوع"
from public.eleves
group by wilaya
order by تلاميذ desc;

-- 4) النشطون فقط (تحديث خلال 7 أيام)
select email, coalesce(nom, '') as nom, niveau, xp, lecons_terminees, drills_faits, maj
from public.eleves
where maj > now() - interval '7 days'
order by maj desc
limit 200;

-- 5) الدروس الهشّة عند التلاميذ — ما يحتاج مراجعة (مع حماية من القيم الفارغة)
select email, coalesce(nom, '') as nom,
       case
         when jsonb_typeof(charge_utile->'lecons_fragiles') = 'array'
         then jsonb_array_length(charge_utile->'lecons_fragiles')
         else 0
       end as "دروس هشّة",
       case
         when jsonb_typeof(charge_utile->'lecons_en_cours') = 'array'
         then jsonb_array_length(charge_utile->'lecons_en_cours')
         else 0
       end as "دروس جارية"
from public.eleves
where jsonb_typeof(charge_utile->'lecons_fragiles') = 'array'
  and jsonb_array_length(charge_utile->'lecons_fragiles') > 0
order by "دروس هشّة" desc
limit 200;

-- 6) أكثر الدروس الهشّة تكرارًا عبر كل التلاميذ
select lecon, count(*) as "عدد التلاميذ"
from public.eleves,
     jsonb_array_elements_text(
       case
         when jsonb_typeof(charge_utile->'lecons_fragiles') = 'array'
         then charge_utile->'lecons_fragiles'
         else '[]'::jsonb
       end
     ) as lecon
group by lecon
order by "عدد التلاميذ" desc
limit 20;

-- 7) أكثر الدروس إكمالًا
select lecon, count(*) as "عدد التلاميذ"
from public.eleves,
     jsonb_array_elements_text(
       case
         when jsonb_typeof(charge_utile->'lecons_terminees') = 'array'
         then charge_utile->'lecons_terminees'
         else '[]'::jsonb
       end
     ) as lecon
group by lecon
order by "عدد التلاميذ" desc
limit 20;

-- 8) نسبة الإجابات الصحيحة لكل تلميذ (حساب يدوي — التطبيق نفسه لا يعرض نسبًا)
select email, coalesce(nom, '') as nom,
       reponses_justes as "صحيحة",
       reponses_fausses as "خاطئة",
       reponses_justes + reponses_fausses as "المجموع",
       case
         when reponses_justes + reponses_fausses > 0
         then round(100.0 * reponses_justes / (reponses_justes + reponses_fausses), 1)
         else null
       end as "% صحيحة"
from public.eleves
where reponses_justes + reponses_fausses > 0
order by "% صحيحة" desc
limit 200;

-- 9) بحث عن تلميذ بالبريد (تجنّب % في البداية متى أمكن لاستغلال فهرس البريد)
select email, nom, wilaya, daira, niveau, xp, lecons_terminees, maj
from public.eleves
where email ilike 'الكلمة%'
limit 50;

-- 10) ملخّص سريع للمشروع كاملًا
select count(*)                                   as "إجمالي التلاميذ",
       count(*) filter (where maj > now() - interval '1 days')  as "نشطون اليوم",
       count(*) filter (where maj > now() - interval '7 days')  as "نشطون الأسبوع",
       round(avg(xp))                             as "متوسط XP",
       round(avg(lecons_terminees), 1)            as "متوسط الدروس",
       round(avg(drills_faits), 1)                as "متوسط التدريبات",
       sum(reponses_justes)                       as "إجمالي الصحيحة",
       sum(reponses_fausses)                      as "إجمالي الخاطئة"
from public.eleves;
