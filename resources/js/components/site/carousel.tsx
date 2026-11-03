import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';

const AUTOPLAY_MS = 2000;
const RESUME_AFTER_TOUCH_MS = 4000;

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

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
 * Carrusel automático: se desliza solo y en bucle mientras está en pantalla. Se detiene al pasar el puntero
 * o enfocarlo con teclado, y unos segundos si alguien lo toca. Con "reducir movimiento" solo se mueve a mano.
 */
export function Carousel<T extends { id: number }>({
    items,
    label,
    itemLabel,
    renderItem,
}: {
    items: T[];
    label: string;
    itemLabel: string;
    renderItem: (item: T) => ReactNode;
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
            aria-label={label}
            onPointerDown={() => {
                pausedUntil.current = Date.now() + RESUME_AFTER_TOUCH_MS;
            }}
        >
            <ul
                ref={trackRef}
                className="-mx-1 -mt-2 -mb-10 flex snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] gap-4 overflow-x-auto px-1 pt-2 pb-10 [&::-webkit-scrollbar]:hidden"
            >
                {items.map((item, i) => (
                    <li
                        key={item.id}
                        className="ent-pop w-[78%] shrink-0 snap-start first:ml-auto last:mr-auto sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
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
