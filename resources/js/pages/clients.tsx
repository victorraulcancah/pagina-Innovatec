import { ClientGrid } from '@/components/site/clients-section';
import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { Phased, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

export default function Clients({ home }: { home: HomeContent }) {
    const c = home.sections.clients;

    return (
        <SiteLayout home={home} title="Clientes" description={c.intro}>
            <PageHero title={`${c.title} ${c.accent}`.trim()} intro={c.intro} imageUrl={c.imageUrl} />

            <Phased className="bg-ice py-20 text-night lg:py-28">
                <div aria-hidden="true" className="ent-glow absolute -left-32 top-0 size-[28rem] rounded-full bg-signal/25 blur-3xl" />
                <div className={`${sectionShell} relative`}>
                    <ClientGrid items={c.items} />
                </div>
            </Phased>

            <CtaBand title="Súmate a quienes ya confían en nosotros" />
        </SiteLayout>
    );
}
