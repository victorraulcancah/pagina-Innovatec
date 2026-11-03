import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';

const AUTOPLAY_MS = 2000;
const RESUME_AFTER_TOUCH_MS = 4000;

const COLUMNS = {
    3: 'md:auto-cols-[calc((100%-2rem)/3)]',
    4: 'md:auto-cols-[calc((100%-2rem)/3)] lg:auto-cols-[calc((100%-3rem)/4)]',
};

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

/** Avanza o retrocede una ficha; al llegar a un extremo vuelve por el otro. */
function slide(track: HTMLElement, direction: 1 | -1) {
    const cards = Array.from(track.children) as HTMLElement[];
    // La primera tarjeta de la siguiente columna: con dos filas, la segunda tarjeta está justo debajo de la primera.
    const next = cards.find((card) => card.offsetLeft > cards[0].offsetLeft);

    if (!next) {
        return;
    }

    const step = next.offsetLeft - cards[0].offsetLeft;
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
    itemLabel,
    onClick,
}: {
    direction: 1 | -1;
    itemLabel: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`${itemLabel} ${direction === 1 ? 'siguiente' : 'anterior'}`}
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
 * Carrusel: se desliza solo y en bucle mientras está en pantalla (`autoplay`, cada `intervalMs`). Se detiene al pasar
 * el puntero o enfocarlo con teclado, y unos segundos si alguien lo toca. Con "reducir movimiento" solo se mueve a mano.
 * `rows` son las filas y `perView` las tarjetas por fila en pantalla grande.
 */
export function Carousel<T extends { id: number }>({
    items,
    label,
    itemLabel,
    renderItem,
    rows = 1,
    perView = 4,
    autoplay = true,
    intervalMs = AUTOPLAY_MS,
}: {
    items: T[];
    label: string;
    itemLabel: string;
    renderItem: (item: T) => ReactNode;
    rows?: 1 | 2;
    perView?: 3 | 4;
    autoplay?: boolean;
    intervalMs?: number;
}) {
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

        const timer =
            !autoplay ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
                  }, intervalMs);

        return () => {
            resize.disconnect();
            seen.disconnect();
            window.clearInterval(timer);
        };
    }, [autoplay, intervalMs]);

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
            aria-label={label}
            onPointerDown={() => {
                pausedUntil.current = Date.now() + RESUME_AFTER_TOUCH_MS;
            }}
        >
            <ul
                ref={trackRef}
                className={`-mx-1 -mt-2 -mb-10 grid snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] auto-cols-[78%] grid-flow-col [justify-content:safe_center] gap-4 overflow-x-auto px-1 pt-2 pb-10 sm:auto-cols-[calc((100%-1rem)/2)] [&::-webkit-scrollbar]:hidden ${COLUMNS[perView]} ${rows === 2 ? 'grid-rows-2' : ''}`}
            >
                {items.map((item, i) => (
                    <li
                        key={item.id}
                        className="ent-pop snap-start"
                        style={d(150 + Math.min(i, 4) * 70)}
                    >
                        {renderItem(item)}
                    </li>
                ))}
            </ul>

            {scrollable && (
                <div
                    className="ent-rise relative mt-8 flex justify-center gap-3"
                    style={d(500)}
                >
                    <CarouselArrow
                        direction={-1}
                        itemLabel={itemLabel}
                        onClick={() => move(-1)}
                    />
                    <CarouselArrow
                        direction={1}
                        itemLabel={itemLabel}
                        onClick={() => move(1)}
                    />
                </div>
            )}
        </div>
    );
}
