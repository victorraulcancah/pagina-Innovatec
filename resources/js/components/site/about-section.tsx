import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

/** Pictogramas de línea de las dos tarjetas (por posición). */
function CardIcon({ index }: { index: number }) {
    const common = {
        width: 64,
        height: 64,
        viewBox: '0 0 64 64',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinejoin: 'round' as const,
        strokeLinecap: 'round' as const,
        'aria-hidden': true,
    };

    return index === 0 ? (
        <svg {...common}>
            <path d="M32 6l22 12.5v27L32 58 10 45.5v-27L32 6z" />
            <path d="M10 18.5L32 31l22-12.5M32 31v27" />
            <ellipse cx="32" cy="27" rx="7" ry="3" />
            <path d="M25 27v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
    ) : (
        <svg {...common}>
            <path d="M20 40a10 10 0 01-1-19.9A13 13 0 0144.5 17 11 11 0 0146 40H20z" />
            <rect x="26" y="34" width="12" height="10" rx="2" />
            <path d="M29 34v-3a3 3 0 016 0v3" />
        </svg>
    );
}

export function AboutSection({ about }: { about: SiteSections['about'] }) {
    return (
        <section id="nosotros" className="scroll-mt-20 bg-night py-24 lg:py-32">
            <div className={`${sectionShell} grid items-center gap-14 lg:grid-cols-[1fr_minmax(0,700px)] lg:gap-20`}>
                <Reveal>
                    <SectionHeading title={about.title} accent={about.accent} />
                    {about.body && (
                        <p className="mt-7 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg">
                            {about.body}
                        </p>
                    )}
                </Reveal>

                {about.cards.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:gap-5">
                        {about.cards.map((card, i) => (
                            <Reveal key={card.id} delay={i * 120}>
                                <a
                                    href={card.url}
                                    className="group relative block overflow-hidden bg-night-2"
                                >
                                    <span className="flex h-20 items-center justify-between bg-white px-4 text-night sm:h-28 sm:px-6">
                                        <span className="text-sm font-medium sm:text-base">{card.label}</span>
                                        <span className="scale-[0.6] sm:scale-90">
                                            <CardIcon index={i} />
                                        </span>
                                    </span>
                                    <span className="relative block aspect-[3/4]">
                                        {card.imageUrl ? (
                                            <img
                                                src={card.imageUrl}
                                                alt=""
                                                loading="lazy"
                                                className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="block size-full bg-[radial-gradient(ellipse_at_30%_30%,#0b2f78,#050b1a_70%)]" />
                                        )}
                                        <span className="absolute bottom-0 right-0 flex size-11 items-center justify-center bg-signal text-night transition-colors group-hover:bg-white sm:size-12">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                                <path d="M4 4l10 10M14 6v8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                    </span>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
