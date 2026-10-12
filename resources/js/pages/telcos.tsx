import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { Pictogram } from '@/components/site/pictogram';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

const serviceIcons = ['analisis', 'implementacion', 'soporte'];
const valueIcons = ['expertise', 'flexibilidad', 'confianza'];

function Check() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-1 shrink-0 text-signal">
            <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Telcos({ home }: { home: HomeContent }) {
    const t = home.sections.telcos;
    const partnerImage = t.partnerImageUrl ?? home.sections.about.imageUrl ?? home.sections.about.cards[0]?.imageUrl ?? null;
    const telefonicaCase = home.sections.experience.cases.find((c) => /telef/i.test(c.client));

    return (
        <SiteLayout home={home} title={t.title} description={t.intro}>
            <PageHero title={t.title} subtitle={t.subtitle} intro={t.intro} imageUrl={t.imageUrl} />

            <section className="bg-night py-20 lg:py-28">
                <div className={`${sectionShell} grid items-center gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20`}>
                    {partnerImage && (
                        <Reveal>
                            <img src={partnerImage} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        </Reveal>
                    )}
                    <Reveal delay={120} className={partnerImage ? '' : 'lg:col-span-2'}>
                        <SectionHeading title={t.partner_title} className="!text-[clamp(1.25rem,2.6vw,2.2rem)]" />
                        <p className="mt-7 max-w-[60ch] text-base leading-[1.8] text-white/75 sm:text-lg">{t.partner_text}</p>
                    </Reveal>
                </div>
            </section>

            {t.services.length > 0 && (
                <section className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <ul className="grid gap-4 lg:grid-cols-3">
                            {t.services.map((service, i) => (
                                <li key={service.id}>
                                    <Reveal delay={i * 90} className="h-full">
                                        <article className="flex h-full flex-col overflow-hidden border border-white/15 bg-night">
                                            {service.imageUrl && (
                                                <img
                                                    src={service.imageUrl}
                                                    alt=""
                                                    loading="lazy"
                                                    className="aspect-[16/10] w-full object-cover"
                                                />
                                            )}
                                            <div className="flex flex-1 flex-col p-7">
                                                {!service.imageUrl && (
                                                    <Pictogram
                                                        slug={serviceIcons[i % serviceIcons.length]}
                                                        strokeWidth={1}
                                                        className="mb-6 size-14 text-signal"
                                                    />
                                                )}
                                                <h2 className="font-display text-base uppercase leading-snug text-white sm:text-lg">
                                                    {service.title}
                                                </h2>
                                                {service.summary && (
                                                    <p className="mt-3 text-sm leading-relaxed text-white/70">{service.summary}</p>
                                                )}
                                                {service.points.length > 0 && (
                                                    <ul className="mt-6 space-y-3 text-sm leading-relaxed text-white/80">
                                                        {service.points.map((point, k) => (
                                                            <li key={`${point}-${k}`} className="flex gap-3">
                                                                <Check />
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </article>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {t.blocks.map((block, i) => (
                <section key={block.id} className={i % 2 === 0 ? 'bg-night' : 'bg-night-2'}>
                    <div
                        className={`${sectionShell} grid items-center gap-10 py-20 lg:gap-20 lg:py-24 ${
                            block.imageUrl ? 'lg:grid-cols-2' : ''
                        }`}
                    >
                        {block.imageUrl && (
                            <Reveal className={i % 2 === 1 ? 'lg:order-2' : ''}>
                                <img src={block.imageUrl} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                            </Reveal>
                        )}
                        <Reveal delay={100}>
                            <SectionHeading title={block.title} className="!text-[clamp(1.25rem,2.4vw,2rem)]" />
                            {block.body && (
                                <p className="mt-6 max-w-[60ch] whitespace-pre-line text-base leading-[1.8] text-white/75">{block.body}</p>
                            )}
                            {block.points.length > 0 && (
                                <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-white/80">
                                    {block.points.map((point, k) => (
                                        <li key={`${point}-${k}`} className="flex gap-3">
                                            <Check />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {block.url && (
                                <a
                                    href={block.url}
                                    className="mt-8 inline-flex min-h-11 items-center rounded-full border border-white/70 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night"
                                >
                                    Conocer más
                                </a>
                            )}
                        </Reveal>
                    </div>
                </section>
            ))}

            {t.values.length > 0 && (
                <section className="bg-night py-20 lg:py-28">
                    <div className={sectionShell}>
                        <Reveal className="mx-auto max-w-[56ch] text-center">
                            <SectionHeading title={t.values_title} className="!text-[clamp(1.25rem,2.6vw,2.2rem)]" />
                            {t.values_intro && <p className="mt-5 text-base leading-relaxed text-white/70">{t.values_intro}</p>}
                        </Reveal>
                        <ul className="mt-14 grid gap-10 md:grid-cols-3">
                            {t.values.map((value, i) => (
                                <li key={value.id} className="text-center">
                                    <Reveal delay={i * 90}>
                                        {value.imageUrl ? (
                                            <img
                                                src={value.imageUrl}
                                                alt=""
                                                loading="lazy"
                                                className="mx-auto size-24 rounded-full object-cover"
                                            />
                                        ) : (
                                            <Pictogram
                                                slug={valueIcons[i % valueIcons.length]}
                                                strokeWidth={1}
                                                className="mx-auto size-16 text-signal"
                                            />
                                        )}
                                        <h3 className="mt-6 font-display text-base uppercase text-white">{value.title}</h3>
                                        {value.body && (
                                            <p className="mx-auto mt-3 max-w-[32ch] text-sm leading-relaxed text-white/70">{value.body}</p>
                                        )}
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {t.gallery.length > 0 && (
                <section className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {t.gallery.map((item, i) => (
                                <li key={item.id}>
                                    <Reveal delay={(i % 3) * 80}>
                                        <figure>
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.caption} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                                            )}
                                            {item.caption && (
                                                <figcaption className="mt-3 text-sm leading-relaxed text-white/70">{item.caption}</figcaption>
                                            )}
                                        </figure>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {telefonicaCase && (
                <section className="bg-night-2 py-16 lg:py-20">
                    <div className={`${sectionShell} grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center lg:gap-16`}>
                        <Reveal>
                            <SectionHeading title="Experiencia con operadoras" className="!text-[clamp(1.25rem,2.4vw,2rem)]" />
                        </Reveal>
                        <Reveal delay={100}>
                            <h3 className="font-display text-base uppercase text-signal">{telefonicaCase.client}</h3>
                            {telefonicaCase.summary && (
                                <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-white/75">{telefonicaCase.summary}</p>
                            )}
                            <a href="/experiencia" className="mt-5 inline-block text-sm font-medium text-signal hover:underline">
                                Ver más casos de éxito →
                            </a>
                        </Reveal>
                    </div>
                </section>
            )}

            <CtaBand title={t.cta_title} />
        </SiteLayout>
    );
}
