import { Head } from '@inertiajs/react';
import { AboutSection } from '@/components/site/about-section';
import { ClientsSection } from '@/components/site/clients-section';
import { ContactSection } from '@/components/site/contact-section';
import { ExperienceSection } from '@/components/site/experience-section';
import { Hero } from '@/components/site/hero';
import { OfferingsSection } from '@/components/site/offerings-section';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import type { HomeContent } from '@/types';

export default function Home({ home }: { home: HomeContent }) {
    const s = home.sections;

    return (
        <>
            <Head title="Inicio">
                <meta name="description" content={home.subtitle ?? home.title} />
            </Head>
            <SiteHeader home={home} />
            <main>
                <Hero home={home} />
                <AboutSection about={s.about} />
                <OfferingsSection id="soluciones" tone="night-2" {...s.solutions} />
                <OfferingsSection id="servicios" {...s.services} />
                <ExperienceSection experience={s.experience} />
                <ClientsSection clients={s.clients} />
                <ContactSection contact={s.contact} />
            </main>
            <SiteFooter home={home} />
        </>
    );
}
