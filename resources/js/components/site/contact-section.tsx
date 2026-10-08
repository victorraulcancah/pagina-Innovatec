import type { SiteSections } from '@/types';
import { Reveal } from './reveal';

/** Lista de datos de contacto con enlaces directos (correo, teléfono, web). */
export function ContactDetails({ contact }: { contact: SiteSections['contact'] }) {
    const web = contact.website.replace(/^https?:\/\//, '');
    const rows = [
        contact.email && { label: 'Correo', text: contact.email, href: `mailto:${contact.email}` },
        contact.phone && { label: 'Teléfono', text: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, '')}` },
        contact.address && { label: 'Dirección', text: contact.address, href: null },
        web && { label: 'Web', text: web, href: `https://${web}` },
    ].filter(Boolean) as { label: string; text: string; href: string | null }[];

    return (
        <Reveal delay={120}>
            <dl className="divide-y divide-white/15 border-y border-white/15">
                {rows.map((row) => (
                    <div key={row.label} className="grid gap-1 py-5 sm:grid-cols-[120px_1fr] sm:gap-6">
                        <dt className="text-sm text-white/55">{row.label}</dt>
                        <dd className="text-base text-white">
                            {row.href ? (
                                <a
                                    href={row.href}
                                    className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-signal"
                                >
                                    {row.text}
                                </a>
                            ) : (
                                row.text
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </Reveal>
    );
}
