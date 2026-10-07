import type { Offering } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

export function OfferingsSection({
    id,
    title,
    intro,
    items,
    tone = 'night',
}: {
    id: string;
    title: string;
    intro: string;
    items: Offering[];
    tone?: 'night' | 'night-2';
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section
            id={id}
            className={`scroll-mt-20 py-24 lg:py-32 ${tone === 'night' ? 'bg-night' : 'bg-night-2'}`}
        >
            <div className={`${sectionShell} grid gap-12 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16`}>
                <Reveal className="lg:sticky lg:top-32 lg:self-start">
                    <SectionHeading title={title} className="!text-[clamp(1.25rem,2.3vw,2rem)] break-words" />
                    {intro && (
                        <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-white/70">{intro}</p>
                    )}
                </Reveal>

                <ul className="border-b border-white/15">
                    {items.map((item) => (
                        <li key={item.id} className="border-t border-white/15 py-8 sm:py-10">
                            <Reveal>
                                <h3 className="font-display text-lg uppercase leading-snug text-white sm:text-xl">
                                    {item.title}
                                </h3>
                                {item.summary && (
                                    <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/70">
                                        {item.summary}
                                    </p>
                                )}
                                {item.rows.length > 0 && (
                                    <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                                        {item.rows.map((row, i) => (
                                            <div key={`${row.title}-${i}`}>
                                                <dt className="text-sm font-semibold text-signal">{row.title}</dt>
                                                {row.description && (
                                                    <dd className="mt-1 text-sm leading-relaxed text-white/65">
                                                        {row.description}
                                                    </dd>
                                                )}
                                            </div>
                                        ))}
                                    </dl>
                                )}
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
