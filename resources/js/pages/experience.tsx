import { CtaBand } from '@/components/site/cta-band';
import { CaseList, CertificationGrid } from '@/components/site/experience-section';
import { PageHero } from '@/components/site/page-hero';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

export default function Experience({ home }: { home: HomeContent }) {
    const e = home.sections.experience;

    return (
        <SiteLayout home={home} title={e.title} description={e.intro}>
            <PageHero
                title={e.title}
                intro={e.intro}
                imageUrl={e.bgUrl}
            />

            {e.cases.length > 0 && (
                <section className="bg-night py-20 lg:py-28">
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading title="Proyectos" className="mb-12 !text-[clamp(1.25rem,2.4vw,2rem)]" />
                        </Reveal>
                        <CaseList items={e.cases} />
                    </div>
                </section>
            )}

            {e.certifications.length > 0 && (
                <section className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading title="Certificaciones" className="mb-12 !text-[clamp(1.25rem,2.4vw,2rem)]" />
                        </Reveal>
                        <CertificationGrid items={e.certifications} />
                    </div>
                </section>
            )}

            <CtaBand title="Tu proyecto puede ser el siguiente" text="Conversemos sobre lo que necesitas." />
        </SiteLayout>
    );
}
