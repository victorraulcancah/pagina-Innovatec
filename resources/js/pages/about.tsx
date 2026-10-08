import { CtaBand } from '@/components/site/cta-band';
import { CertificationGrid } from '@/components/site/experience-section';
import { PageHero } from '@/components/site/page-hero';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

export default function About({ home }: { home: HomeContent }) {
    const { about, experience } = home.sections;
    const image = about.imageUrl ?? about.cards[0]?.imageUrl ?? null;

    return (
        <SiteLayout home={home} title="Nosotros" description={about.body}>
            <PageHero
                title={`${about.title} ${about.accent}`.trim()}
                imageUrl={image}
                crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Nosotros' }]}
            />

            <section className="bg-night py-20 lg:py-28">
                <div className={`${sectionShell} grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-20`}>
                    <Reveal>
                        <SectionHeading title="Quiénes somos" />
                        <p className="mt-7 max-w-[62ch] text-base leading-[1.8] text-white/75 sm:text-lg">{about.story}</p>
                    </Reveal>
                    {image && (
                        <Reveal delay={120}>
                            <img src={image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
                        </Reveal>
                    )}
                </div>
            </section>

            {experience.certifications.length > 0 && (
                <section className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading title="Certificaciones de nuestro equipo" />
                        </Reveal>
                        <div className="mt-12">
                            <CertificationGrid items={experience.certifications} />
                        </div>
                    </div>
                </section>
            )}

            <CtaBand title="Conversemos sobre tu proyecto" text="Cuéntanos qué necesitas y te ayudamos a encontrar la solución." />
        </SiteLayout>
    );
}
