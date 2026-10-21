import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { HomeContent } from '@/types';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { WhatsappButton } from './whatsapp-button';

/** Marco común de las páginas públicas: cabecera, contenido y pie. */
export function SiteLayout({
    home,
    title,
    description,
    children,
}: {
    home: HomeContent;
    title: string;
    description?: string | null;
    children: ReactNode;
}) {
    const { url } = usePage();

    return (
        <>
            <Head title={title}>{description && <meta name="description" content={description} />}</Head>
            <SiteHeader home={home} />
            {/* La clave remonta el contenido al cambiar de ruta: entrada breve, sin recargar el marco. */}
            <main key={url} className="page-enter">
                {children}
            </main>
            <SiteFooter home={home} />
            <WhatsappButton number={home.sections.contact.whatsapp} />
        </>
    );
}
