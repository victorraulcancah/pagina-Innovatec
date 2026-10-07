import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

export function ClientsSection({ clients }: { clients: SiteSections['clients'] }) {
    if (clients.items.length === 0) {
        return null;
    }

    return (
        <section id="clientes" className="scroll-mt-20 bg-night-2 py-24 lg:py-32">
            <div className={sectionShell}>
                <Reveal>
                    <SectionHeading title={clients.title} accent={clients.accent} className="text-center" />
                </Reveal>

                <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    {clients.items.map((client, i) => (
                        <li key={client.id}>
                            <Reveal delay={(i % 7) * 50}>
                                <div className="flex aspect-[3/2] items-center justify-center rounded-md bg-white p-4">
                                    {client.logoUrl ? (
                                        <img
                                            src={client.logoUrl}
                                            alt={client.name}
                                            loading="lazy"
                                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                                        />
                                    ) : (
                                        <span className="text-center text-xs font-medium text-night">{client.name}</span>
                                    )}
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
