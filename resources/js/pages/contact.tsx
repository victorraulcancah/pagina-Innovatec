import { ContactForm } from '@/components/site/contact-form';
import { ContactDetails } from '@/components/site/contact-section';
import { PageHero } from '@/components/site/page-hero';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
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
                <div className={`${sectionShell} grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-20`}>
                    <Reveal>
                        <SectionHeading title="Escríbenos" className="mb-8 !text-[clamp(1.25rem,2.4vw,2rem)]" />
                        <ContactForm />
                    </Reveal>
                    <div>
                        <SectionHeading title="Datos de contacto" className="mb-8 !text-[clamp(1.25rem,2.4vw,2rem)]" />
                        <ContactDetails contact={c} />
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
