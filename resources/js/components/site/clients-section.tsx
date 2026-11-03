import { Fragment, type CSSProperties } from 'react';
import type { SiteSections } from '@/types';
import { Carousel } from './carousel';
import { Phased, sectionShell } from './reveal';

type Clients = SiteSections['clients'];
type Client = Clients['items'][number];

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

/** Titular que sube palabra por palabra al entrar la sección (las palabras en color van aparte). */
function Heading({
    title,
    accent,
    center = false,
}: {
    title: string;
    accent?: string;
    center?: boolean;
}) {
    const words = [
        ...title
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => ({ w, accent: false })),
        ...(accent ?? '')
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => ({ w, accent: true })),
    ];

    return (
        <>
            <h2
                className={`font-display text-[clamp(1.4rem,3.2vw,2.6rem)] leading-[1.14] text-balance text-night uppercase ${center ? 'text-center' : ''}`}
            >
                {words.map(({ w, accent: isAccent }, i) => (
                    <Fragment key={`${w}-${i}`}>
                        {i > 0 && ' '}
                        <span
                            className={`ent-word ${isAccent ? 'text-signal-deep' : ''}`}
                            style={{ ['--i' as string]: i } as CSSProperties}
                        >
                            {w}
                        </span>
                    </Fragment>
                ))}
            </h2>
            <span
                className={`ent-line mt-5 block h-[3px] w-20 rounded-full bg-signal-deep ${center ? 'mx-auto' : ''}`}
            />
        </>
    );
}

/** Un cliente: su logo, su nombre y, si se escribió, un texto breve sobre lo que hacemos con él. */
export function ClientCard({ client }: { client: Client }) {
    return (
        <figure className="inc-card group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_18px_36px_-24px_rgba(17,40,92,0.6)] ring-1 ring-night/10">
            <div className="flex h-28 items-center justify-center px-6 pt-4">
                {client.logoUrl ? (
                    <img
                        src={client.logoUrl}
                        alt=""
                        loading="lazy"
                        className="max-h-16 max-w-full object-contain transition-transform duration-500 ease-out-expo group-hover:scale-110"
                    />
                ) : (
                    <span className="text-center font-display text-sm text-night uppercase">
                        {client.name}
                    </span>
                )}
            </div>
            <figcaption className="mt-3 flex flex-1 flex-col border-t border-night/10 px-4 pt-3 pb-5 text-center">
                <span className="text-sm leading-snug font-semibold text-night">
                    {client.name}
                </span>
                {client.description && (
                    <span className="mt-1.5 text-xs leading-relaxed text-[#2b3d66]">
                        {client.description}
                    </span>
                )}
            </figcaption>
            <span
                aria-hidden="true"
                className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal-deep"
            />
        </figure>
    );
}

/** Rejilla de clientes con la entrada escalonada de su sección. */
export function ClientGrid({ items }: { items: Client[] }) {
    return (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((client, i) => (
                <li
                    key={client.id}
                    className="ent-pop"
                    style={d(150 + (i % 8) * 70)}
                >
                    <ClientCard client={client} />
                </li>
            ))}
        </ul>
    );
}

/** Versión de portada: el texto informativo y el carrusel con todos los clientes. */
export function ClientsTeaser({ clients }: { clients: Clients }) {
    if (clients.items.length === 0) {
        return null;
    }

    return (
        <Phased className="bg-ice py-24 text-night lg:py-32">
            <div
                aria-hidden="true"
                className="ent-glow absolute top-0 -left-32 size-[28rem] rounded-full bg-signal/25 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="ent-glow absolute -right-32 bottom-0 size-[28rem] rounded-full bg-signal-deep/20 blur-3xl"
            />

            <div className={`${sectionShell} relative`}>
                <div className="mx-auto max-w-[62ch] text-center">
                    <Heading
                        title={clients.title}
                        accent={clients.accent}
                        center
                    />
                    {clients.intro && (
                        <p
                            className="ent-rise mt-6 text-base leading-relaxed text-[#2b3d66] sm:text-lg"
                            style={d(250)}
                        >
                            {clients.intro}
                        </p>
                    )}
                </div>

                <div className="mt-14">
                    <Carousel
                        items={clients.items}
                        label="Clientes"
                        itemLabel="Cliente"
                        renderItem={(client) => <ClientCard client={client} />}
                    />
                </div>
            </div>
        </Phased>
    );
}
