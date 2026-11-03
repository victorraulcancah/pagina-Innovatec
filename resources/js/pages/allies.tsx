import { AllyGrid } from '@/components/site/allies-section';
import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { Phased, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

export default function Allies({ home }: { home: HomeContent }) {
    const a = home.sections.allies;

    return (
        <SiteLayout home={home} title={a.title} description={a.intro}>
            <PageHero title={a.title} intro={a.intro} imageUrl={a.imageUrl} />

            {a.items.length > 0 && (
                <Phased className="bg-night-2 py-20 lg:py-28">
                    <div
                        aria-hidden="true"
                        className="ent-glow absolute -right-32 bottom-0 size-[28rem] rounded-full bg-signal-deep/45 blur-3xl"
                    />
                    <div className={`${sectionShell} relative`}>
                        <AllyGrid items={a.items} />
                    </div>
                </Phased>
            )}

            <CtaBand title="Conversemos sobre tu proyecto" />
        </SiteLayout>
    );
}
