interface AIChatWidgetProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  comingSoonLabel?: string;
  tone?: 'default' | 'critical' | 'info' | 'success';
  tags?: string[];
}

const toneStyles: Record<Required<AIChatWidgetProps>['tone'], { badge: string; button: string; buttonHover: string }> = {
  default: {
    badge: 'bg-slate-100 text-slate-600',
    button: 'bg-slate-900 text-white',
    buttonHover: 'hover:bg-slate-800',
  },
  critical: {
    badge: 'bg-[#ffebee] text-[#c62828]',
    button: 'bg-[#d32f2f] text-white',
    buttonHover: 'hover:bg-[#b71c1c]',
  },
  info: {
    badge: 'bg-[#e3f2fd] text-[#1565c0]',
    button: 'bg-[#1565c0] text-white',
    buttonHover: 'hover:bg-[#0d47a1]',
  },
  success: {
    badge: 'bg-[#e8f5e9] text-[#2e7d32]',
    button: 'bg-[#2e7d32] text-white',
    buttonHover: 'hover:bg-[#1b5e20]',
  },
};

export default function AIChatWidget({
  title,
  description,
  ctaLabel = 'Launch AI assistant',
  ctaHref,
  onCtaClick,
  comingSoonLabel = 'Coming soon',
  tone = 'default',
  tags,
}: AIChatWidgetProps) {
  const styles = toneStyles[tone];

  return (
    <div className="rounded-2xl border border-white bg-gradient-to-br from-white via-white to-[#f8fafc] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles.badge}`}>
          AI assist
        </span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{comingSoonLabel}</span>
      </div>

      <h4 className="mt-4 text-lg font-semibold text-gray-900">{title}</h4>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>

      {tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {onCtaClick ? (
        <button
          type="button"
          onClick={onCtaClick}
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${styles.button} ${styles.buttonHover}`}
        >
          {ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      ) : ctaHref ? (
        <a
          href={ctaHref}
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${styles.button} ${styles.buttonHover}`}
        >
          {ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      ) : (
        <button
          type="button"
          disabled
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold opacity-70 cursor-not-allowed ${styles.button} ${styles.buttonHover}`}
        >
          {ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      )}
    </div>
  );
}
