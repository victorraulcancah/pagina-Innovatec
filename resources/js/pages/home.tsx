import { Head } from '@inertiajs/react';
import { Hero } from '@/components/site/hero';
import { SiteHeader } from '@/components/site/site-header';
import type { HomeContent } from '@/types';

export default function Home({ home }: { home: HomeContent }) {
    return (
        <>
            <Head title="Inicio">
                <meta name="description" content={home.subtitle ?? home.title} />
            </Head>
            <SiteHeader home={home} />
            <main>
                <Hero home={home} />
            </main>
        </>
    );
}
