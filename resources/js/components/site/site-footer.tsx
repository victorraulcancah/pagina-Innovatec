import type { ReactNode } from 'react';
import { linkIsVisible } from '@/lib/hidden-pages';
import { whatsappUrl } from '@/lib/whatsapp';
import type { HomeContent } from '@/types';
import { LegalLinks } from './legal-links';
import { sectionShell } from './reveal';
import { SocialLinks } from './social-links';

function Column({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <ul className="mt-5 space-y-3 text-sm text-white">{children}</ul>
        </div>
    );
}

const link =
    'link-line transition-colors hover:text-signal focus-visible:text-signal';

export function SiteFooter({ home }: { home: HomeContent }) {
    const { contact, footer, social, company, legal: documents } = home.sections;
    // Las divisiones salen del menú (solo trae las opciones visibles): mismo nombre y mismo submenú que en la barra.
    const divisions = ['/division-enterprise', '/division-services']
        .map((url) => home.menu.find((item) => item.url === url))
        .filter((item) => item !== undefined);
    const navCta = home.navCta && linkIsVisible(home, home.navCta.url) ? home.navCta : null;
    const web = contact.website.replace(/^https?:\/\//, '');
    const rights =
        footer.copyright || `© ${new Date().getFullYear()} ${home.brandName}. Todos los derechos reservados.`;
    const legal = [company.legal_name, company.tax_id ? `RUC ${company.tax_id}` : ''].filter(Boolean).join(' · ');

    return (
        <footer className="border-t border-white/10 bg-[#0c1f4d]">
            <div className={`${sectionShell} grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:gap-10`}>
                <div className="sm:col-span-2 lg:col-span-1">
                    <a href="/" aria-label={home.brandName} className="inline-block">
                        <img src={home.logoUrl} alt={home.brandName} className="h-9 w-auto" />
                    </a>
                    {footer.tagline && (
                        <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-white">{footer.tagline}</p>
                    )}
                    <SocialLinks social={social} className="mt-6" />
                </div>

                <Column title="Navegación">
                    {home.menu.map((item, i) => (
                        <li key={`${item.label}-${i}`}>
                            <a href={item.url} className={link}>
                                {item.label}
                            </a>
                        </li>
                    ))}
                    {navCta && (
                        <li>
                            <a href={navCta.url} className={link}>
                                {navCta.label}
                            </a>
                        </li>
                    )}
                </Column>

                {divisions.length > 0 && (
                    <Column title="Divisiones">
                        {divisions.map((division) => (
                            <li key={division.url}>
                                <a href={division.url} className={link}>
                                    {division.label}
                                </a>
                                {division.children.length > 0 && (
                                    <ul className="mt-3 space-y-3 pl-3">
                                        {division.children.map((child, i) => (
                                            <li key={`${child.url}-${i}`}>
                                                <a href={child.url} className={link}>
                                                    {child.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </Column>
                )}

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
                    {whatsappUrl(contact.whatsapp) && (
                        <li>
                            <a
                                href={whatsappUrl(contact.whatsapp) ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={link}
                            >
                                WhatsApp {contact.whatsapp}
                            </a>
                        </li>
                    )}
                    {contact.address && <li className="max-w-[30ch] leading-relaxed">{contact.address}</li>}
                    {contact.hours && <li className="max-w-[30ch] leading-relaxed">{contact.hours}</li>}
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
                <div className={`${sectionShell} flex flex-col gap-5 pt-6 pb-24 text-xs text-white sm:pb-6 lg:flex-row lg:items-center lg:justify-between`}>
                    <div className="space-y-2">
                        <p>
                            {rights}
                            {legal && <span className="ml-2">{legal}</span>}
                        </p>
                        <a href="#top" className={`${link} inline-block`}>
                            Volver arriba ↑
                        </a>
                    </div>
                    {/* El margen derecho deja libre el botón flotante de WhatsApp. */}
                    <div className="lg:pr-20">
                        <LegalLinks docs={documents} className={link} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
