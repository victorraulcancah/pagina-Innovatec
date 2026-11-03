import { usePage } from '@inertiajs/react';
import { linkIsVisible } from '@/lib/hidden-pages';
import type { HomeContent } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

/** Cierre de página con una acción clara hacia Contacto. Si esa página está oculta, no se muestra. */
export function CtaBand({
    title,
    text,
    href = '/contacto',
    label = 'Contáctanos',
}: {
    title: string;
    text?: string;
    href?: string;
    label?: string;
}) {
    const { home } = usePage<{ home: HomeContent }>().props;

    if (!linkIsVisible(home, href)) {
        return null;
    }

    return (
        <section className="bg-night py-20 sm:py-24">
            <div className={`${sectionShell} flex flex-col items-start justify-between gap-8 border-t border-white/15 pt-14 lg:flex-row lg:items-center`}>
                <Reveal>
                    <SectionHeading title={title} className="max-w-[22ch] !text-[clamp(1.25rem,2.6vw,2.1rem)]" />
                    {text && <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-white">{text}</p>}
                </Reveal>
                <Reveal delay={120}>
                    <a
                        href={href}
                        className="btn-sheen inline-flex min-h-12 items-center rounded-full border border-signal bg-signal px-8 text-sm font-medium text-night transition-colors hover:border-white hover:bg-white"
                    >
                        {label}
                    </a>
                </Reveal>
            </div>
        </section>
    );
}
