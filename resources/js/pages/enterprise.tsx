import type { CSSProperties } from 'react';
import { CtaBand } from '@/components/site/cta-band';
import { LineVisual } from '@/components/site/line-visual';
import { PageHero } from '@/components/site/page-hero';
import { Pictogram } from '@/components/site/pictogram';
import { Reveal, SectionHeading, sectionShell, useSeen } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent, Offering } from '@/types';

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

function ArrowRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Acceso rápido a cada línea: banda clara bajo la cabecera. */
function LineIndex({ lines }: { lines: Offering[] }) {
    if (lines.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Líneas de solución" className="bg-ice py-8 lg:py-10">
            <ul className={`${sectionShell} grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5`}>
                {lines.map((line, i) => (
                    <li key={line.id}>
                        <Reveal delay={i * 60}>
                            <a
                                href={`#${line.slug ?? `linea-${line.id}`}`}
                                className="ent-chip group flex h-full items-center gap-3 rounded-lg bg-white px-4 py-3.5 text-night shadow-[0_10px_24px_-16px_rgba(17,40,92,0.55)] ring-1 ring-night/10 transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-[0_18px_30px_-16px_rgba(31,98,217,0.6)]"
                            >
                                <Pictogram slug={line.slug} strokeWidth={1.4} className="ent-chip-icon size-9 shrink-0 text-signal-deep" />
                                <span className="text-sm font-semibold leading-snug">{line.title}</span>
                            </a>
                        </Reveal>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function LineSection({ line, index }: { line: Offering; index: number }) {
    const light = index % 2 === 1;
    const flip = index % 2 === 1;
    const { ref, phase } = useSeen<HTMLElement>(0.15);
    const logos = line.gallery.slice(0, 6);
    const more = line.gallery.length - logos.length;

    return (
        <section
            ref={ref}
            id={line.slug ?? `linea-${line.id}`}
            data-phase={phase}
            className={`ent relative scroll-mt-20 overflow-hidden py-20 lg:py-28 ${light ? 'bg-ice text-night' : 'bg-night text-white'}`}
        >
            {/* Resplandor de fondo que deriva despacio */}
            <div
                aria-hidden="true"
                className={`ent-glow absolute -z-0 size-[28rem] rounded-full blur-3xl ${flip ? '-left-32 top-0' : '-right-32 bottom-0'} ${
                    light ? 'bg-signal/25' : 'bg-signal-deep/45'
                }`}
            />

            <div className={`${sectionShell} relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16`}>
                <div className={`lg:col-span-5 ${flip ? 'lg:order-2' : ''}`}>
                    <div className="ent-drift">
                        <div className="ent-viz" style={d(100)}>
                            <LineVisual
                                slug={line.slug}
                                imageUrl={line.imageUrl}
                                className="aspect-[4/3] w-full shadow-[0_30px_60px_-30px_rgba(5,11,26,0.7)]"
                            />
                        </div>
                    </div>
                </div>

                <div className={`lg:col-span-7 ${flip ? 'lg:order-1' : ''}`}>
                    <div className="ent-rise flex items-start gap-4" style={d(0)}>
                        <Pictogram
                            slug={line.slug}
                            strokeWidth={1.1}
                            className={`mt-1 size-12 shrink-0 ${light ? 'text-signal-deep' : 'text-signal'}`}
                        />
                        <h2 className="font-display text-xl uppercase leading-snug sm:text-2xl lg:text-[1.75rem]">{line.title}</h2>
                    </div>
                    <span className={`ent-line mt-5 block h-[3px] w-20 rounded-full ${light ? 'bg-signal-deep' : 'bg-signal'}`} />

                    {line.summary && (
                        <p
                            className={`ent-rise mt-6 max-w-[58ch] text-base leading-relaxed sm:text-lg ${light ? 'text-[#2b3d66]' : 'text-white'}`}
                            style={d(160)}
                        >
                            {line.summary}
                        </p>
                    )}

                    {line.rows.length > 0 && (
                        <ul className={`mt-8 divide-y ${light ? 'divide-night/15 border-y border-night/15' : 'divide-white/15 border-y border-white/15'}`}>
                            {line.rows.map((row, k) => (
                                <li key={`${row.title}-${k}`} className="ent-rise group flex gap-4 py-4" style={d(260 + k * 110)}>
                                    <span
                                        aria-hidden="true"
                                        className={`ent-tick mt-2 size-2.5 shrink-0 rotate-45 border transition-transform duration-300 ease-out-expo group-hover:scale-125 ${
                                            light ? 'border-signal-deep bg-signal-deep/15' : 'border-signal bg-signal/20'
                                        }`}
                                    />
                                    <div>
                                        <h3 className={`text-base font-semibold ${light ? 'text-signal-deep' : 'text-signal'}`}>{row.title}</h3>
                                        {row.description && (
                                            <p className={`mt-1 text-sm leading-relaxed ${light ? 'text-[#2b3d66]' : 'text-white'}`}>{row.description}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {logos.length > 0 && (
                        <ul className="ent-rise mt-7 flex flex-wrap items-center gap-2.5" style={d(620)} aria-label="Marcas con las que trabajamos">
                            {logos.map((logo, k) => (
                                <li
                                    key={`${logo.name}-${k}`}
                                    className="flex h-12 w-24 items-center justify-center rounded-md bg-white px-3 shadow-[0_8px_16px_-10px_rgba(5,11,26,0.6)] ring-1 ring-night/10 transition-transform duration-300 ease-out-expo hover:-translate-y-1"
                                >
                                    <img src={logo.url} alt={logo.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                                </li>
                            ))}
                            {more > 0 && <li className={`text-sm font-medium ${light ? 'text-night' : 'text-white'}`}>+{more} más</li>}
                        </ul>
                    )}

                    <div className="ent-rise" style={d(720)}>
                        <a
                            href={line.url}
                            className={`group relative mt-8 inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full px-7 text-sm font-semibold transition-colors ${
                                light ? 'bg-night text-white' : 'bg-signal text-night hover:bg-white'
                            }`}
                        >
                            {light && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 origin-left scale-x-0 bg-signal-deep transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
                                />
                            )}
                            <span className="relative">Ver detalle</span>
                            <span className="relative transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
                                <ArrowRight />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Enterprise({ home }: { home: HomeContent }) {
    const { enterprise, solutions, services } = home.sections;
    const next = solutions.items.length % 2 === 0 ? 'bg-night' : 'bg-ice';

    return (
        <SiteLayout home={home} title={enterprise.title} description={enterprise.intro}>
            <PageHero
                title={enterprise.title}
                subtitle={enterprise.subtitle}
                intro={enterprise.intro}
                imageUrl={enterprise.imageUrl}
                actions={
                    <a
                        href={enterprise.cta_url || '/contacto'}
                        className="inline-flex min-h-12 items-center rounded-full border border-signal bg-signal px-8 text-sm font-medium text-night transition-colors hover:border-white hover:bg-white"
                    >
                        {enterprise.cta_label || 'Contáctanos'}
                    </a>
                }
            />

            <LineIndex lines={solutions.items} />

            {solutions.items.map((line, i) => (
                <LineSection key={line.id} line={line} index={i} />
            ))}

            {services.items.length > 0 && (
                <section className={`py-20 lg:py-24 ${next === 'bg-ice' ? 'bg-ice' : 'bg-night-2'}`}>
                    <div className={sectionShell}>
                        <Reveal>
                            {next === 'bg-ice' ? (
                                <h2 className="font-display text-[clamp(1.4rem,3.2vw,2.6rem)] leading-[1.14] uppercase text-balance text-night">
                                    {services.title}
                                </h2>
                            ) : (
                                <SectionHeading title={services.title} />
                            )}
                            {services.intro && (
                                <p className={`mt-5 max-w-[56ch] text-base leading-relaxed ${next === 'bg-ice' ? 'text-[#2b3d66]' : 'text-white'}`}>
                                    {services.intro}
                                </p>
                            )}
                        </Reveal>
                        <SolutionCards items={services.items} className="mt-12" />
                    </div>
                </section>
            )}

            <CtaBand title={enterprise.cta_title} />
        </SiteLayout>
    );
}
