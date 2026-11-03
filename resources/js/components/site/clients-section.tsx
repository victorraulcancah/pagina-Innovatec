import {
    Fragment,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
} from 'react';
import type { SiteSections } from '@/types';
import { Phased, sectionShell } from './reveal';

type Clients = SiteSections['clients'];
type Client = Clients['items'][number];

const AUTOPLAY_MS = 4000;
const RESUME_AFTER_TOUCH_MS = 8000;

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

/** Avanza o retrocede una ficha; al llegar a un extremo vuelve por el otro. */
function slide(track: HTMLElement, direction: 1 | -1) {
    const [first, second] = Array.from(track.children) as HTMLElement[];

    if (!first || !second) {
        return;
    }

    const step = second.offsetLeft - first.offsetLeft;
    const max = track.scrollWidth - track.clientWidth;
    const left = track.scrollLeft;
    const target =
        direction === 1
            ? left >= max - 2
                ? 0
                : left + step
            : left <= 2
              ? max
              : left - step;

    track.scrollTo({
        left: target,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
    });
}

function CarouselArrow({
    direction,
    onClick,
}: {
    direction: 1 | -1;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={
                direction === 1 ? 'Cliente siguiente' : 'Cliente anterior'
            }
            className="inline-flex size-12 items-center justify-center rounded-full bg-white text-night shadow-[0_14px_28px_-18px_rgba(17,40,92,0.8)] ring-1 ring-night/10 transition-colors duration-300 hover:bg-night hover:text-white"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className={direction === 1 ? '' : 'rotate-180'}
            >
                <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

/**
 * Carrusel automático de clientes: se desliza solo y en bucle mientras está en pantalla. Se detiene al pasar
 * el puntero o enfocarlo con teclado, y unos segundos si alguien lo toca. Con "reducir movimiento" solo se mueve a mano.
 */
export function ClientCarousel({ items }: { items: Client[] }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLUListElement>(null);
    const pausedUntil = useRef(0);
    const [scrollable, setScrollable] = useState(true);

    useEffect(() => {
        const root = rootRef.current;
        const track = trackRef.current;

        if (!root || !track) {
            return;
        }

        let inView = false;

        const resize = new ResizeObserver(() =>
            setScrollable(track.scrollWidth > track.clientWidth + 1),
        );
        const seen = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
            },
            { threshold: 0.3 },
        );

        resize.observe(track);
        seen.observe(track);

        const timer = window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? undefined
            : window.setInterval(() => {
                  if (
                      inView &&
                      Date.now() >= pausedUntil.current &&
                      !document.hidden &&
                      !root.matches(':hover, :has(:focus-visible)')
                  ) {
                      slide(track, 1);
                  }
              }, AUTOPLAY_MS);

        return () => {
            resize.disconnect();
            seen.disconnect();
            window.clearInterval(timer);
        };
    }, []);

    const move = (direction: 1 | -1) => {
        if (trackRef.current) {
            slide(trackRef.current, direction);
        }
    };

    return (
        <div
            ref={rootRef}
            role="group"
            aria-roledescription="carrusel"
            aria-label="Clientes"
            onPointerDown={() => {
                pausedUntil.current = Date.now() + RESUME_AFTER_TOUCH_MS;
            }}
        >
            <ul
                ref={trackRef}
                className="-mx-1 -mt-2 -mb-10 flex snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] gap-4 overflow-x-auto px-1 pt-2 pb-10 [&::-webkit-scrollbar]:hidden"
            >
                {items.map((client, i) => (
                    <li
                        key={client.id}
                        className="ent-pop w-[78%] shrink-0 snap-start first:ml-auto last:mr-auto sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
                        style={d(150 + Math.min(i, 4) * 70)}
                    >
                        <ClientCard client={client} />
                    </li>
                ))}
            </ul>

            {scrollable && (
                <div
                    className="ent-rise relative mt-8 flex justify-center gap-3"
                    style={d(500)}
                >
                    <CarouselArrow direction={-1} onClick={() => move(-1)} />
                    <CarouselArrow direction={1} onClick={() => move(1)} />
                </div>
            )}
        </div>
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
                    <ClientCarousel items={clients.items} />
                </div>
            </div>
        </Phased>
    );
}
