import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

export function ContactSection({ contact }: { contact: SiteSections['contact'] }) {
    const web = contact.website.replace(/^https?:\/\//, '');
    const rows = [
        contact.email && { label: 'Correo', text: contact.email, href: `mailto:${contact.email}` },
        contact.phone && { label: 'Teléfono', text: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, '')}` },
        contact.address && { label: 'Dirección', text: contact.address, href: null },
        web && { label: 'Web', text: web, href: `https://${web}` },
    ].filter(Boolean) as { label: string; text: string; href: string | null }[];

    return (
        <section id="contacto" className="scroll-mt-20 bg-night">
            <div className={`${sectionShell} grid gap-12 py-24 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-20 lg:py-32`}>
                <Reveal>
                    <SectionHeading title={contact.title} />
                    {contact.body && (
                        <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-white/75 sm:text-lg">
                            {contact.body}
                        </p>
                    )}
                    {contact.email && (
                        <a
                            href={`mailto:${contact.email}`}
                            className="mt-9 inline-flex min-h-11 items-center rounded-full border border-signal bg-signal px-6 text-sm font-medium text-night transition-colors hover:border-white hover:bg-white"
                        >
                            Escríbenos
                        </a>
                    )}
                </Reveal>

                <Reveal delay={120}>
                    <dl className="divide-y divide-white/15 border-y border-white/15">
                        {rows.map((row) => (
                            <div key={row.label} className="grid gap-1 py-5 sm:grid-cols-[120px_1fr] sm:gap-6">
                                <dt className="text-sm text-white/55">{row.label}</dt>
                                <dd className="text-base text-white">
                                    {row.href ? (
                                        <a href={row.href} className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-signal">
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
            </div>

        </section>
    );
}
