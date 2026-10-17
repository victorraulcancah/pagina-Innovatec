import { Fragment, type CSSProperties, type PointerEvent } from 'react';
import type { SiteSections } from '@/types';
import { sectionShell, useSeen } from './reveal';

/** Pictogramas de línea de las dos tarjetas (por posición). Se redibujan al pasar el puntero. */
function CardIcon({ index }: { index: number }) {
    const common = {
        width: 64,
        height: 64,
        viewBox: '0 0 64 64',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinejoin: 'round' as const,
        strokeLinecap: 'round' as const,
        'aria-hidden': true,
        className: 'about-icon',
    };

    return index === 0 ? (
        <svg {...common}>
            <path pathLength={1} d="M32 6l22 12.5v27L32 58 10 45.5v-27L32 6z" />
            <path pathLength={1} d="M10 18.5L32 31l22-12.5M32 31v27" />
            <ellipse pathLength={1} cx="32" cy="27" rx="7" ry="3" />
            <path pathLength={1} d="M25 27v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
    ) : (
        <svg {...common}>
            <path pathLength={1} d="M20 40a10 10 0 01-1-19.9A13 13 0 0144.5 17 11 11 0 0146 40H20z" />
            <rect pathLength={1} x="26" y="34" width="12" height="10" rx="2" />
            <path pathLength={1} d="M29 34v-3a3 3 0 016 0v3" />
        </svg>
    );
}

/** Palabras sueltas para que el titular suba una a una. */
function Words({ text, start = 0, className = '' }: { text: string; start?: number; className?: string }) {
    return text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, i) => (
            <Fragment key={`${word}-${i}`}>
                {i > 0 && ' '}
                <span className={`about-word ${className}`} style={{ ['--i' as string]: start + i } as CSSProperties}>
                    {word}
                </span>
            </Fragment>
        ));
}

function tilt(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse') {
        return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    e.currentTarget.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
}

function untilt(e: PointerEvent<HTMLElement>) {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
}

/** Ondas concéntricas que se expanden detrás de las tarjetas (decoración). */
function Rings() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            fill="none"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 text-signal-deep"
        >
            {[0, 1, 2].map((i) => (
                <circle
                    key={i}
                    className="about-ring"
                    style={{ ['--i' as string]: i } as CSSProperties}
                    cx="200"
                    cy="200"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            ))}
        </svg>
    );
}

export function AboutSection({ about }: { about: SiteSections['about'] }) {
    const { ref, phase } = useSeen<HTMLElement>(0.2);
    const accentStart = about.title.split(/\s+/).filter(Boolean).length;

    return (
        <section
            ref={ref}
            data-phase={phase}
            className="about relative isolate overflow-hidden bg-ice py-24 lg:py-36"
        >
            {/* Fondo: retícula de puntos y dos resplandores que derivan despacio */}
            <div
                aria-hidden="true"
                className="about-dots absolute inset-0 -z-20 [background-image:radial-gradient(circle,rgba(17,40,92,0.16)_1px,transparent_1.6px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_75%_at_68%_50%,black,transparent_75%)]"
            />
            <div aria-hidden="true" className="about-glow about-glow-a absolute -left-24 top-10 -z-20 size-[26rem] rounded-full bg-signal/25 blur-3xl" />
            <div aria-hidden="true" className="about-glow about-glow-b absolute -right-20 bottom-0 -z-20 size-[30rem] rounded-full bg-signal-deep/15 blur-3xl" />

            <div className={`${sectionShell} grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14 xl:gap-20`}>
                <div>
                    <h2 className="font-display text-[clamp(1.4rem,3.2vw,2.6rem)] leading-[1.14] uppercase text-balance text-night">
                        <Words text={about.title} />
                        {about.accent && (
                            <>
                                {' '}
                                <Words text={about.accent} start={accentStart} className="text-signal-deep" />
                            </>
                        )}
                    </h2>
                    <span className="about-line mt-6 block h-[3px] w-24 rounded-full bg-signal-deep" />

                    {about.body && (
                        <p
                            className="about-fade mt-7 max-w-[52ch] text-base leading-relaxed text-[#2b3d66] sm:text-lg"
                            style={{ ['--d' as string]: '350ms' } as CSSProperties}
                        >
                            {about.body}
                        </p>
                    )}

                    <div className="about-fade" style={{ ['--d' as string]: '500ms' } as CSSProperties}>
                        <a
                            href="/nosotros"
                            className="group relative mt-9 inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-night px-7 text-sm font-medium text-white shadow-[0_14px_28px_-14px_rgba(17,40,92,0.8)] transition-shadow hover:shadow-[0_18px_34px_-14px_rgba(31,98,217,0.9)]"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 origin-left scale-x-0 bg-signal-deep transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
                            />
                            <span className="relative">{about.more_label || 'Conoce más sobre nosotros'}</span>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                                className="relative transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                            >
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>

                {about.cards.length > 0 && (
                    <div className="relative">
                        <Rings />
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {about.cards.map((card, i) => (
                                <div
                                    key={card.id}
                                    className={`about-drift ${i % 2 === 1 ? 'lg:mt-16' : ''}`}
                                    style={{ ['--from' as string]: i % 2 === 1 ? '60px' : '24px', ['--to' as string]: i % 2 === 1 ? '-14px' : '-24px' } as CSSProperties}
                                >
                                    <a
                                        href={card.url}
                                        onPointerMove={tilt}
                                        onPointerLeave={untilt}
                                        className="about-card group relative block"
                                        style={{ ['--d' as string]: `${300 + i * 160}ms` } as CSSProperties}
                                    >
                                        <span className="about-clip block overflow-hidden bg-night shadow-[0_28px_50px_-26px_rgba(17,40,92,0.75)]">
                                            <span className="about-bar relative z-10 flex h-20 items-center justify-between bg-white px-4 text-night sm:h-28 sm:px-6">
                                                <span className="text-sm font-medium sm:text-base">{card.label}</span>
                                                <span className="scale-[0.6] text-signal-deep sm:scale-90">
                                                    <CardIcon index={i} />
                                                </span>
                                            </span>
                                            <span className="relative block aspect-[3/4] overflow-hidden">
                                                <span className="about-img block size-full">
                                                    {card.imageUrl ? (
                                                        <img
                                                            src={card.imageUrl}
                                                            alt=""
                                                            loading="lazy"
                                                            className="about-photo size-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="block size-full bg-[radial-gradient(ellipse_at_30%_30%,#1f4fb0,#11285c_70%)]" />
                                                    )}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(17,40,92,0.55),transparent_45%)]"
                                                />
                                                <span className="absolute bottom-0 right-0 flex size-11 items-center justify-center bg-signal text-night transition-colors duration-300 group-hover:bg-white sm:size-12">
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 18 18"
                                                        fill="none"
                                                        aria-hidden="true"
                                                        className="transition-transform duration-300 ease-out-expo group-hover:rotate-[-45deg]"
                                                    >
                                                        <path d="M4 4l10 10M14 6v8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                                    </svg>
                                                </span>
                                            </span>
                                        </span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
