import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { Pictogram } from '@/components/site/pictogram';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent } from '@/types';

function ArrowRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Enterprise({ home }: { home: HomeContent }) {
    const { enterprise, solutions, services } = home.sections;

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

            {solutions.items.map((line, i) => (
                <section key={line.id} className={`py-20 lg:py-24 ${i % 2 === 0 ? 'bg-night' : 'bg-night-2'}`}>
                    <div className={sectionShell}>
                        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                            <div className="flex items-start gap-5">
                                <Pictogram slug={line.slug} strokeWidth={1} className="mt-1 size-12 shrink-0 text-signal" />
                                <div>
                                    <h2 className="font-display text-xl uppercase leading-snug text-white sm:text-2xl">{line.title}</h2>
                                    {line.summary && (
                                        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-white/70">{line.summary}</p>
                                    )}
                                </div>
                            </div>
                            <a
                                href={line.url}
                                className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-signal hover:underline"
                            >
                                Ver detalle
                                <span className="transition-transform group-hover:translate-x-1">
                                    <ArrowRight />
                                </span>
                            </a>
                        </Reveal>

                        {line.rows.length > 0 && (
                            <ul className="mt-10 grid gap-px overflow-hidden bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
                                {line.rows.map((row, k) => (
                                    <li key={`${row.title}-${k}`} className="bg-night p-6">
                                        <Reveal delay={(k % 3) * 70}>
                                            <h3 className="text-base font-semibold text-signal">{row.title}</h3>
                                            {row.description && (
                                                <p className="mt-2 text-sm leading-relaxed text-white/70">{row.description}</p>
                                            )}
                                        </Reveal>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            ))}

            {services.items.length > 0 && (
                <section className={`py-20 lg:py-24 ${solutions.items.length % 2 === 0 ? 'bg-night' : 'bg-night-2'}`}>
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading title={services.title} />
                            {services.intro && (
                                <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-white/70">{services.intro}</p>
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
