import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { Reveal, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent } from '@/types';

export default function Offerings({ home, kind }: { home: HomeContent; kind: 'soluciones' | 'servicios' }) {
    const block = kind === 'soluciones' ? home.sections.solutions : home.sections.services;
    const other = kind === 'soluciones' ? home.sections.services : home.sections.solutions;
    const otherHref = kind === 'soluciones' ? '/servicios' : '/soluciones';

    return (
        <SiteLayout home={home} title={block.title} description={block.intro}>
            <PageHero
                title={block.title}
                intro={block.intro}
                imageUrl={block.imageUrl}
            />

            <section className="bg-night-2 py-20 lg:py-28">
                <div className={sectionShell}>
                    <SolutionCards items={block.items} />
                    {block.items.length === 0 && <p className="text-white/70">Pronto publicaremos esta información.</p>}

                    {other.items.length > 0 && (
                        <Reveal className="mt-16 border-t border-white/15 pt-8">
                            <a href={otherHref} className="group inline-flex items-center gap-3 text-base text-white/80 transition-colors hover:text-signal">
                                Ver también: {other.title}
                                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                            </a>
                        </Reveal>
                    )}
                </div>
            </section>

            <CtaBand title="¿No encuentras lo que buscas?" text="Cuéntanos tu necesidad y armamos una propuesta a tu medida." />
        </SiteLayout>
    );
}
