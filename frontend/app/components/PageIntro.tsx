'use client';

import type { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  description?: string;
  kicker?: string;
  actions?: ReactNode;
}

export default function PageIntro({ title, description, kicker, actions }: PageIntroProps) {
  return (
    <section className="rounded-[26px] border border-white bg-white/85 shadow-[0_16px_40px_rgba(15,23,42,0.08)] px-8 py-10 space-y-6 mb-6">
      <div className="space-y-4 max-w-3xl">
        {kicker ? (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffebee] text-[#b71c1c] text-xs font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d32f2f]" />
            {kicker}
          </span>
        ) : null}
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="text-base text-gray-600 leading-relaxed">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

