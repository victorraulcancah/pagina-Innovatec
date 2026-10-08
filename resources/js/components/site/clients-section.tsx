import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

type Clients = SiteSections['clients'];

/** Logos de clientes sobre fichas claras (el blanco del logo se funde con la ficha). */
export function ClientGrid({ items }: { items: Clients['items'] }) {
    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {items.map((client, i) => (
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
    );
}

/** Versión de portada: primeros logos y enlace a la página Clientes. */
export function ClientsTeaser({ clients }: { clients: Clients }) {
    if (clients.items.length === 0) {
        return null;
    }

    return (
        <section className="bg-night-2 py-24 lg:py-32">
            <div className={sectionShell}>
                <Reveal>
                    <SectionHeading title={clients.title} accent={clients.accent} className="text-center" />
                </Reveal>
                <div className="mt-14">
                    <ClientGrid items={clients.items.slice(0, 14)} />
                </div>
                <div className="mt-10 text-center">
                    <a
                        href="/clientes"
                        className="inline-flex min-h-11 items-center rounded-full border border-white/70 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night"
                    >
                        Ver todos los clientes
                    </a>
                </div>
            </div>
        </section>
    );
}
