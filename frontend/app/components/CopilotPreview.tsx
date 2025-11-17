'use client';

export interface CopilotPreviewProps {
  label: string;
  title: string;
  summary: string;
  accent?: 'default' | 'critical' | 'info' | 'success';
  stats?: Array<{ label: string; value: string; helper?: string }>;
  highlights?: Array<{ title: string; body: string }>;
  prompts?: string[];
  storyline?: Array<{ speaker: 'You' | 'Assistant'; text: string }>;
  infoBlocks?: Array<{ title: string; items: string[] }>;
}

const accentStyles: Record<
  NonNullable<CopilotPreviewProps['accent']>,
  { tag: string; chip: string; dot: string; border: string }
> = {
  default: {
    tag: 'bg-slate-100 text-slate-600',
    chip: 'bg-slate-200 text-slate-700',
    dot: 'bg-slate-400',
    border: 'border-slate-200/70',
  },
  critical: {
    tag: 'bg-[#ffebee] text-[#b71c1c]',
    chip: 'bg-[#fee2e2] text-[#b91c1c]',
    dot: 'bg-rose-400',
    border: 'border-[#fecdd3]',
  },
  info: {
    tag: 'bg-[#e3f2fd] text-[#0d47a1]',
    chip: 'bg-[#dbeafe] text-[#1d4ed8]',
    dot: 'bg-sky-400',
    border: 'border-[#bfdbfe]',
  },
  success: {
    tag: 'bg-[#dcfce7] text-[#166534]',
    chip: 'bg-[#bbf7d0] text-[#15803d]',
    dot: 'bg-emerald-400',
    border: 'border-[#bbf7d0]',
  },
};

export default function CopilotPreview({
  label,
  title,
  summary,
  accent = 'default',
  stats,
  highlights,
  prompts,
  storyline,
  infoBlocks,
}: CopilotPreviewProps) {
  const accentStyle = accentStyles[accent];

  return (
    <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accentStyle.tag}`}
          >
            {label}
          </span>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 ${accentStyle.border}`}>
          Copilot preview
        </div>
      </div>

      <header className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="max-w-3xl text-sm text-gray-600 leading-relaxed">{summary}</p>
      </header>

      {stats?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, idx) => (
            <div
              key={`${stat.label}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{stat.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
              {stat.helper ? <p className="mt-1 text-xs text-gray-500">{stat.helper}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {highlights?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map((highlight, idx) => (
            <div
              key={`${highlight.title}-${idx}`}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">{highlight.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{highlight.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {prompts?.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Quick prompts</h3>
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt, idx) => (
              <span
                key={`${prompt}-${idx}`}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accentStyle.chip}`}
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {storyline?.length ? (
        <div className="rounded-2xl border border-slate-900/10 bg-slate-900/95 p-6 text-slate-100 shadow-inner">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
            <span className={`inline-flex h-2 w-2 rounded-full ${accentStyle.dot}`} />
            Preview moment
          </div>
          <div className="mt-4 space-y-4 text-sm leading-relaxed">
            {storyline.map((step, idx) => (
              <div key={`${step.speaker}-${idx}`} className="space-y-1">
                <p className="font-semibold text-sky-300">{step.speaker}</p>
                <p className="text-slate-200">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {infoBlocks?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {infoBlocks.map((block, idx) => (
            <div
              key={`${block.title}-${idx}`}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm"
            >
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">{block.title}</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {block.items.map((item, itemIdx) => (
                  <li key={`${item}-${itemIdx}`} className="flex items-start gap-2">
                    <span className={`mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${accentStyle.dot}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}


