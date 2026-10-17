import type { CSSProperties } from 'react';
import { CtaBand } from '@/components/site/cta-band';
import { LineVisual } from '@/components/site/line-visual';
import { PageHero } from '@/components/site/page-hero';
import { Phased, Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent, Offering } from '@/types';

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

/** Glifos de línea que se dibujan al entrar; uno por tarjeta, rotando. */
function Glyph({ index }: { index: number }) {
    const common = {
        width: 40,
        height: 40,
        viewBox: '0 0 48 48',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
        className: 'inc-glyph',
    };

    switch (index % 4) {
        case 0:
            return (
                <svg {...common}>
                    <path pathLength={1} d="M24 5l16 9v20l-16 9-16-9V14z" />
                    <circle pathLength={1} cx="24" cy="24" r="6" />
                </svg>
            );
        case 1:
            return (
                <svg {...common}>
                    <path pathLength={1} d="M24 6l18 9-18 9-18-9z" />
                    <path pathLength={1} d="M6 24l18 9 18-9M6 33l18 9 18-9" />
                </svg>
            );
        case 2:
            return (
                <svg {...common}>
                    <circle pathLength={1} cx="24" cy="10" r="5" />
                    <circle pathLength={1} cx="9" cy="37" r="5" />
                    <circle pathLength={1} cx="39" cy="37" r="5" />
                    <path pathLength={1} d="M21 14.500L11.500 32.500M27 14.500l9.500 18M14 37h20" />
                </svg>
            );
        default:
            return (
                <svg {...common}>
                    <rect pathLength={1} x="11" y="11" width="26" height="26" rx="4" />
                    <path pathLength={1} d="M18 5v6M30 5v6M18 37v6M30 37v6M5 18h6M5 30h6M37 18h6M37 30h6" />
                    <path pathLength={1} d="M19 24h10M24 19v10" />
                </svg>
            );
    }
}

function LogoTile({ logo, hidden = false }: { logo: { name: string; url: string }; hidden?: boolean }) {
    return (
        <li aria-hidden={hidden || undefined} className="mr-3 shrink-0">
            <div className="flex h-20 w-40 items-center justify-center rounded-md bg-white px-5 shadow-[0_10px_20px_-12px_rgba(5,11,26,0.7)]">
                <img src={logo.url} alt={hidden ? '' : logo.name} loading="lazy" className="max-h-full max-w-full object-contain" />
            </div>
        </li>
    );
}

/** Marquesina de logos (se detiene al pasar el puntero; con "reducir movimiento" es una rejilla). */
function LogoMarquee({ logos, reverse = false }: { logos: { name: string; url: string }[]; reverse?: boolean }) {
    // Cada mitad debe cubrir una pantalla ancha (≈12 mosaicos) para que el bucle no deje huecos.
    const set = Array.from({ length: Math.max(1, Math.ceil(12 / logos.length)) }, () => logos).flat();

    return (
        <div className={`mq ${reverse ? 'mq-rev' : ''}`}>
            <ul className="mq-track">
                {set.map((logo, i) => (
                    <LogoTile key={`${logo.name}-${i}`} logo={logo} hidden={i >= logos.length} />
                ))}
                {set.map((logo, i) => (
                    <LogoTile key={`${logo.name}-copy-${i}`} logo={logo} hidden />
                ))}
            </ul>
        </div>
    );
}

export default function OfferingPage({
    home,
    kind,
    slug,
}: {
    home: HomeContent;
    kind: 'soluciones' | 'servicios';
    slug: string;
}) {
    const block = kind === 'soluciones' ? home.sections.solutions : home.sections.services;
    const item: Offering | undefined = block.items.find((i) => i.slug === slug);

    if (!item) {
        return null;
    }

    const others = block.items.filter((i) => i.slug !== slug).slice(0, 3);
    const logos = item.gallery;
    const half = Math.ceil(logos.length / 2);

    return (
        <SiteLayout home={home} title={item.title} description={item.summary}>
            <PageHero
                title={item.title}
                intro={item.summary}
                aside={<LineVisual slug={item.slug} imageUrl={item.imageUrl} className="aspect-[4/3] w-full max-lg:hidden" />}
            />

            {item.rows.length > 0 && (
                <Phased className="bg-ice py-20 text-night lg:py-28">
                    <div aria-hidden="true" className="ent-glow absolute -left-24 top-10 size-[26rem] rounded-full bg-signal/25 blur-3xl" />
                    <div className={`${sectionShell} relative grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20`}>
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <h2 className="ent-rise font-display text-[clamp(1.25rem,2.4vw,2rem)] leading-[1.14] uppercase text-balance text-night" style={d(0)}>
                                Qué incluye
                            </h2>
                            <span className="ent-line mt-5 block h-[3px] w-20 rounded-full bg-signal-deep" />
                            <div className="ent-viz mt-8" style={d(150)}>
                                <LineVisual
                                    slug={item.slug}
                                    imageUrl={item.imageUrl}
                                    className="aspect-[4/3] w-full shadow-[0_30px_60px_-30px_rgba(5,11,26,0.7)]"
                                />
                            </div>
                        </div>

                        <ul className="grid gap-5">
                            {item.rows.map((row, i) => (
                                <li key={`${row.title}-${i}`} className="ent-rise" style={d(200 + i * 130)}>
                                    <article className="inc-card group relative overflow-hidden rounded-xl bg-white p-6 shadow-[0_18px_40px_-26px_rgba(17,40,92,0.55)] ring-1 ring-night/10 sm:p-8">
                                        <div className="flex items-start gap-5">
                                            <span className="inc-tile flex size-14 shrink-0 items-center justify-center rounded-lg bg-night text-signal">
                                                <Glyph index={i} />
                                            </span>
                                            <div>
                                                <h3 className="font-display text-lg uppercase leading-snug text-night sm:text-xl">{row.title}</h3>
                                                {row.description && (
                                                    <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-[#2b3d66]">{row.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span aria-hidden="true" className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal-deep" />
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            {logos.length > 0 && (
                <Phased className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <div className="ent-rise" style={d(0)}>
                            <SectionHeading
                                title={kind === 'soluciones' ? 'Marcas con las que trabajamos' : 'Tecnologías con las que operamos'}
                                className="!text-[clamp(1.25rem,2.4vw,2rem)]"
                            />
                        </div>
                    </div>
                    <div className="ent-rise mt-12 space-y-3" style={d(200)}>
                        {logos.length > 6 ? (
                            <>
                                <LogoMarquee logos={logos.slice(0, half)} />
                                <LogoMarquee logos={logos.slice(half)} reverse />
                            </>
                        ) : (
                            <LogoMarquee logos={logos} />
                        )}
                    </div>
                </Phased>
            )}

            {others.length > 0 && (
                <section className="bg-night py-20 lg:py-28">
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading
                                title={kind === 'soluciones' ? 'Otras soluciones' : 'Otros servicios'}
                                className="!text-[clamp(1.25rem,2.4vw,2rem)]"
                            />
                        </Reveal>
                        <SolutionCards items={others} className="mt-12" />
                    </div>
                </section>
            )}

            <CtaBand title={`¿Te interesa ${item.title}?`} text="Escríbenos y un especialista te contactará para conversar sobre tu proyecto." />
        </SiteLayout>
    );
}
