// شارة شفافة لحالة المراجعة العلمية (Phase 3) — تظهر فقط للمحتوى غير المُعتمد بعد من أستاذ SVT.
import type { ReviewMetadata } from '../types';

export default function BadgeRelecture({
  review,
  source,
}: {
  review?: ReviewMetadata;
  source?: string;
}) {
  if (!review) return null;
  if (review.reviewed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sage bg-sage-soft/60 px-3 py-1.5 text-[11px] text-forest">
        <span>
          ✓ محتوى مراجَع بيداغوجيًا{review.reviewer ? ` · ${review.reviewer}` : ''}
          {review.date ? ` (${review.date})` : ''}
        </span>
        {source && <span className="text-mute">{source}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 py-1.5 text-[11px] text-mute">
      <span>⏳ قيد المراجعة البيداغوجية (نسخة تدريبية)</span>
      <a
        href="https://github.com/Allintelligence2024/Bawssalate-El-3oloum/issues/new?title=%D8%AA%D8%A8%D9%84%D9%8A%D8%BA+%D8%B9%D9%86+%D8%AE%D8%B7%D8%A3+%D8%B9%D9%84%D9%85%D9%8A"
        target="_blank"
        rel="noreferrer"
        className="font-bold text-forest underline underline-offset-4"
      >
        بلّغ عن خطأ علمي
      </a>
    </div>
  );
}
