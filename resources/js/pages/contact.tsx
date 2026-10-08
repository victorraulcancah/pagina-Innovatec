import { ContactDetails } from '@/components/site/contact-section';
import { PageHero } from '@/components/site/page-hero';
import { Reveal, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

export default function Contact({ home }: { home: HomeContent }) {
    const c = home.sections.contact;

    return (
        <SiteLayout home={home} title="Contacto" description={c.body}>
            <PageHero
                title={c.title}
                intro={c.body}
                imageUrl={c.imageUrl}
                crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]}
            />

            <section className="bg-night py-20 lg:py-28">
                <div className={`${sectionShell} grid gap-12 lg:grid-cols-[1fr_minmax(0,620px)] lg:gap-20`}>
                    <Reveal>
                        {c.email && (
                            <a
                                href={`mailto:${c.email}`}
                                className="inline-flex min-h-12 items-center rounded-full border border-signal bg-signal px-8 text-sm font-medium text-night transition-colors hover:border-white hover:bg-white"
                            >
                                Escríbenos
                            </a>
                        )}
                    </Reveal>
                    <ContactDetails contact={c} />
                </div>
            </section>
        </SiteLayout>
    );
}
