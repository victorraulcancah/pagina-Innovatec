import { ClientGrid } from '@/components/site/clients-section';
import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

export default function Clients({ home }: { home: HomeContent }) {
    const c = home.sections.clients;

    return (
        <SiteLayout home={home} title="Clientes">
            <PageHero
                title={`${c.title} ${c.accent}`.trim()}
                imageUrl={c.imageUrl}
                crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Clientes' }]}
            />

            <section className="bg-night-2 py-20 lg:py-28">
                <div className={sectionShell}>
                    <ClientGrid items={c.items} />
                </div>
            </section>

            <CtaBand title="Súmate a quienes ya confían en nosotros" />
        </SiteLayout>
    );
}
