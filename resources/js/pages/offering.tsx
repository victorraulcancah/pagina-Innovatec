import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { Pictogram } from '@/components/site/pictogram';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent } from '@/types';

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
    const item = block.items.find((i) => i.slug === slug);

    if (!item) {
        return null;
    }

    const others = block.items.filter((i) => i.slug !== slug).slice(0, 3);

    return (
        <SiteLayout home={home} title={item.title} description={item.summary}>
            <PageHero
                title={item.title}
                intro={item.summary}
                crumbs={[
                    { label: 'Inicio', href: '/' },
                    { label: block.title, href: `/${kind}` },
                    { label: item.title },
                ]}
                aside={
                    item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                    ) : (
                        <div className="hidden aspect-square items-center justify-center border border-white/15 bg-night/40 lg:flex">
                            <Pictogram slug={item.slug} strokeWidth={0.8} className="size-56 text-signal" />
                        </div>
                    )
                }
            />

            {item.rows.length > 0 && (
                <section className="bg-night py-20 lg:py-28">
                    <div className={`${sectionShell} grid gap-12 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-20`}>
                        <Reveal className="lg:sticky lg:top-32 lg:self-start">
                            <SectionHeading title="Qué incluye" className="!text-[clamp(1.25rem,2.4vw,2rem)]" />
                        </Reveal>
                        <ul className="border-b border-white/15">
                            {item.rows.map((row, i) => (
                                <li key={`${row.title}-${i}`} className="border-t border-white/15 py-8 sm:py-10">
                                    <Reveal>
                                        <h3 className="font-display text-lg uppercase leading-snug text-white sm:text-xl">{row.title}</h3>
                                        {row.description && (
                                            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-white/70">{row.description}</p>
                                        )}
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {item.gallery.length > 0 && (
                <section className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading title="Marcas con las que trabajamos" className="!text-[clamp(1.25rem,2.4vw,2rem)]" />
                        </Reveal>
                        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {item.gallery.map((logo, i) => (
                                <li key={`${logo.name}-${i}`}>
                                    <Reveal delay={(i % 6) * 50}>
                                        <div className="flex aspect-[3/2] items-center justify-center rounded-md bg-white p-5">
                                            <img
                                                src={logo.url}
                                                alt={logo.name}
                                                loading="lazy"
                                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                                            />
                                        </div>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
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
