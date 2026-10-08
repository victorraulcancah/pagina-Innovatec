import { AboutSection } from '@/components/site/about-section';
import { ClientsTeaser } from '@/components/site/clients-section';
import { CtaBand } from '@/components/site/cta-band';
import { ExperienceTeaser } from '@/components/site/experience-section';
import { Hero } from '@/components/site/hero';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent } from '@/types';

export default function Home({ home }: { home: HomeContent }) {
    const s = home.sections;

    return (
        <SiteLayout home={home} title="Inicio" description={home.subtitle ?? home.title}>
            <Hero home={home} />
            <AboutSection about={s.about} />

            {s.solutions.items.length > 0 && (
                <section className="bg-night-2 py-24 lg:py-32">
                    <div className={sectionShell}>
                        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <SectionHeading title={s.solutions.title} />
                                {s.solutions.intro && (
                                    <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-white/70">{s.solutions.intro}</p>
                                )}
                            </div>
                            <a href="/soluciones" className="text-sm font-medium text-signal underline-offset-4 hover:underline">
                                Ver todas las soluciones →
                            </a>
                        </Reveal>
                        <SolutionCards items={s.solutions.items} className="mt-14" />
                    </div>
                </section>
            )}

            <ExperienceTeaser experience={s.experience} />
            <ClientsTeaser clients={s.clients} />
            <CtaBand title={s.contact.title} text={s.contact.body} />
        </SiteLayout>
    );
}
