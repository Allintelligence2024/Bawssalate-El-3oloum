// القبطان مفتاح — le guide pédagogique de بوصلة العلوم Lite.
//
// Phase 2 « Guide-First » : le guide n'est plus un décor, il a des **humeurs**. Une humeur ne
// change jamais le contenu (c'est le rôle du moteur) : elle change la manière de l'accompagner.
//   accueil        — il ouvre la séance ;
//   reflexion      — il propose un tiraillement de mémoire, sans donner la réponse ;
//   encouragement  — il réagit à une erreur sans culpabiliser ;
//   piege          — il signale un piège repéré (jamais un avertissement rouge) ;
//   victoire       — il marque une preuve acquise.
// Aucun emoji : le libellé est du texte arabe, le glyphe est un SVG.

export type HumeurGuide = 'accueil' | 'reflexion' | 'encouragement' | 'piege' | 'victoire';

interface Props {
  message: string;
  compact?: boolean;
  tone?: 'forest' | 'gold' | 'paper';
  humeur?: HumeurGuide;
}

export const HUMEUR_GUIDE: Record<HumeurGuide, { etiquette: string; ton: 'forest' | 'gold' | 'paper' }> = {
  accueil: { etiquette: 'يفتح الحصة', ton: 'forest' },
  reflexion: { etiquette: 'يفكّر معك', ton: 'paper' },
  encouragement: { etiquette: 'يشجّعك', ton: 'gold' },
  piege: { etiquette: 'ينبّهك إلى فخّ', ton: 'gold' },
  victoire: { etiquette: 'يفرح معك', ton: 'gold' },
};

export default function MascotteKunz({ message, compact = false, tone, humeur = 'accueil' }: Props) {
  const tonalite = tone ?? HUMEUR_GUIDE[humeur].ton;
  const tones = {
    forest: 'border-sage bg-sage-soft text-forest-deep',
    gold: 'border-gold-soft bg-gold-soft/60 text-forest-deep',
    paper: 'border-line bg-paper text-ink',
  };
  return (
    <div
      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 shadow-[0_6px_18px_-14px_rgba(20,61,46,0.5)] ${tones[tonalite]}`}
      dir="rtl"
    >
      {/* هالة ذهبية خفيفة تتبع الشخصية */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-6 h-20 w-20 rounded-full bg-gold/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-70"
        style={{ insetInlineStart: '0.25rem' }}
      />
      <img
        src="/mascotte.webp"
        alt="مستكشف بوصلة العلوم"
        className={`${
          compact ? 'h-14 w-14' : 'h-20 w-20'
        } relative shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105`}
      />
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-extrabold tracking-wide opacity-70">
            القبطان مفتاح · بوصلة العلوم
          </p>
          <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[9px] font-black opacity-80">
            {HUMEUR_GUIDE[humeur].etiquette}
          </span>
        </div>
        <p className={`${compact ? 'text-xs' : 'text-sm'} mt-1 font-bold leading-relaxed`}>
          {message}
        </p>
      </div>
    </div>
  );
}
