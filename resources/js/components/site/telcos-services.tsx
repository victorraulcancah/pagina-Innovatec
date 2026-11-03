import type { CSSProperties } from 'react';
import type { SiteSections } from '@/types';
import { Pictogram } from './pictogram';
import { Phased, SectionHeading, sectionShell } from './reveal';

type Telcos = SiteSections['telcos'];

const serviceIcons = ['analisis', 'implementacion', 'soporte'];

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

/** Marca de verificación que se dibuja al entrar la sección. */
export function Check({
    index = 0,
    light = false,
}: {
    index?: number;
    light?: boolean;
}) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className={`inc-glyph mt-0.5 shrink-0 ${light ? 'text-signal-deep' : 'text-signal'}`}
            style={d(300 + index * 110)}
        >
            <path
                pathLength={1}
                d="M3 8.5l3.2 3.2L13 4.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** Servicios para operadoras: tarjetas blancas con foto y los puntos que incluye cada uno. */
export function TelcosServiceCards({
    services,
}: {
    services: Telcos['services'];
}) {
    return (
        <ul className="grid gap-6 lg:grid-cols-3">
            {services.map((service, i) => (
                <li key={service.id} className="ent-rise" style={d(i * 140)}>
                    <article className="inc-card group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_50px_-28px_rgba(5,11,26,0.9)]">
                        <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#1f4fb0_0%,#17358a_55%,#11285c_100%)]">
                            {service.imageUrl ? (
                                <img
                                    src={service.imageUrl}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                                />
                            ) : (
                                <Pictogram
                                    slug={serviceIcons[i % serviceIcons.length]}
                                    strokeWidth={1}
                                    className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-signal"
                                />
                            )}
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,40,92,0.5),transparent_55%)]"
                            />
                        </div>
                        <div className="flex flex-1 flex-col p-7">
                            <h3 className="font-display text-base leading-snug text-night uppercase sm:text-lg">
                                {service.title}
                            </h3>
                            {service.summary && (
                                <p className="mt-3 text-sm leading-relaxed text-[#2b3d66]">
                                    {service.summary}
                                </p>
                            )}
                            {service.points.length > 0 && (
                                <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#2b3d66]">
                                    {service.points.map((point, k) => (
                                        <li
                                            key={`${point}-${k}`}
                                            className="flex gap-3"
                                        >
                                            <Check index={k} light />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <span
                            aria-hidden="true"
                            className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal-deep"
                        />
                    </article>
                </li>
            ))}
        </ul>
    );
}

/** Versión de portada: título, presentación, enlace a la división y sus servicios. */
export function TelcosTeaser({ telcos }: { telcos: Telcos }) {
    return (
        <Phased className="bg-night py-24 lg:py-32">
            <div
                aria-hidden="true"
                className="ent-glow absolute -right-32 bottom-0 size-[28rem] rounded-full bg-signal-deep/45 blur-3xl"
            />
            <div className={`${sectionShell} relative`}>
                <div
                    className="ent-rise flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-20"
                    style={d(0)}
                >
                    <div>
                        <SectionHeading title={telcos.title} />
                        {telcos.subtitle && (
                            <p className="mt-5 max-w-[60ch] text-base leading-relaxed font-medium text-white sm:text-lg">
                                {telcos.subtitle}
                            </p>
                        )}
                        {telcos.intro && (
                            <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-white">
                                {telcos.intro}
                            </p>
                        )}
                    </div>
                    <a
                        href="/division-telcos"
                        className="inline-flex min-h-12 shrink-0 items-center self-start rounded-full border border-white/70 px-8 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night lg:self-auto"
                    >
                        {telcos.home_button_label || 'Conoce la división'}
                    </a>
                </div>

                {telcos.services.length > 0 && (
                    <div className="mt-14">
                        <TelcosServiceCards services={telcos.services} />
                    </div>
                )}
            </div>
        </Phased>
    );
}
