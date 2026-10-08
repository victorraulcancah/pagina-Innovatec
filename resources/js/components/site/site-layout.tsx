import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { HomeContent } from '@/types';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

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
    return (
        <>
            <Head title={title}>{description && <meta name="description" content={description} />}</Head>
            <SiteHeader home={home} />
            <main>{children}</main>
            <SiteFooter home={home} />
        </>
    );
}
