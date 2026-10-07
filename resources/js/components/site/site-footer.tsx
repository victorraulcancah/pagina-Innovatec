import type { ReactNode } from 'react';
import type { HomeContent } from '@/types';
import { sectionShell } from './reveal';

function Column({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/65">{children}</ul>
        </div>
    );
}

const link =
    'transition-colors hover:text-signal focus-visible:text-signal';

export function SiteFooter({ home }: { home: HomeContent }) {
    const { contact, footer, solutions, services } = home.sections;
    const web = contact.website.replace(/^https?:\/\//, '');

    return (
        <footer className="border-t border-white/10 bg-[#030813]">
            <div className={`${sectionShell} grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:gap-10`}>
                <div className="sm:col-span-2 lg:col-span-1">
                    <a href="/" aria-label={home.brandName} className="inline-block">
                        <img src={home.logoUrl} alt={home.brandName} className="h-9 w-auto" />
                    </a>
                    {footer.tagline && (
                        <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-white/60">{footer.tagline}</p>
                    )}
                </div>

                <Column title="Navegación">
                    {home.menu.map((item, i) => (
                        <li key={`${item.label}-${i}`}>
                            <a href={item.url} className={link}>
                                {item.label}
                            </a>
                        </li>
                    ))}
                    {home.navCta && (
                        <li>
                            <a href={home.navCta.url} className={link}>
                                {home.navCta.label}
                            </a>
                        </li>
                    )}
                </Column>

                <Column title="Soluciones y servicios">
                    {solutions.items.map((item) => (
                        <li key={`s-${item.id}`}>
                            <a href="#soluciones" className={link}>
                                {item.title}
                            </a>
                        </li>
                    ))}
                    {services.items.length > 0 && (
                        <li>
                            <a href="#servicios" className={link}>
                                {services.title}
                            </a>
                        </li>
                    )}
                </Column>

                <Column title="Contacto">
                    {contact.email && (
                        <li>
                            <a href={`mailto:${contact.email}`} className={link}>
                                {contact.email}
                            </a>
                        </li>
                    )}
                    {contact.phone && (
                        <li>
                            <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className={link}>
                                {contact.phone}
                            </a>
                        </li>
                    )}
                    {contact.address && <li className="max-w-[30ch] leading-relaxed">{contact.address}</li>}
                    {web && (
                        <li>
                            <a href={`https://${web}`} className={link}>
                                {web}
                            </a>
                        </li>
                    )}
                </Column>
            </div>

            <div className="border-t border-white/10">
                <div className={`${sectionShell} flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between`}>
                    <p>
                        © {new Date().getFullYear()} {home.brandName}. Todos los derechos reservados.
                    </p>
                    <a href="#top" className={link}>
                        Volver arriba ↑
                    </a>
                </div>
            </div>
        </footer>
    );
}
