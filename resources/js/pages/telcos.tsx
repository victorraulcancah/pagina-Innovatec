import type { CSSProperties, ReactNode } from 'react';
import { CtaBand } from '@/components/site/cta-band';
import { LineVisual } from '@/components/site/line-visual';
import { PageHero } from '@/components/site/page-hero';
import { Pictogram } from '@/components/site/pictogram';
import { Phased, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

const serviceIcons = ['analisis', 'implementacion', 'soporte'];
const valueIcons = ['expertise', 'flexibilidad', 'confianza'];

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

/** Marca de verificación que se dibuja al entrar la sección. */
function Check({ index = 0, light = false }: { index?: number; light?: boolean }) {
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
            <path pathLength={1} d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Título de sección: navy sobre fondo claro, blanco sobre fondo azul. */
function Title({ light, children, className = '' }: { light?: boolean; children: ReactNode; className?: string }) {
    return (
        <h2
            className={`ent-rise font-display text-[clamp(1.25rem,2.6vw,2.2rem)] leading-[1.14] uppercase text-balance ${
                light ? 'text-night' : 'text-white'
            } ${className}`}
            style={d(0)}
        >
            {children}
        </h2>
    );
}

function Glow({ side, light }: { side: 'left' | 'right'; light: boolean }) {
    return (
        <div
            aria-hidden="true"
            className={`ent-glow absolute size-[28rem] rounded-full blur-3xl ${side === 'left' ? '-left-32 top-0' : '-right-32 bottom-0'} ${
                light ? 'bg-signal/25' : 'bg-signal-deep/45'
            }`}
        />
    );
}

function Arrow() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Telcos({ home }: { home: HomeContent }) {
    const t = home.sections.telcos;
    const partnerImage = t.partnerImageUrl ?? home.sections.about.imageUrl ?? home.sections.about.cards[0]?.imageUrl ?? null;

    return (
        <SiteLayout home={home} title={t.title} description={t.intro}>
            <PageHero title={t.title} subtitle={t.subtitle} intro={t.intro} imageUrl={t.imageUrl} />

            {/* Partner técnico: banda clara */}
            <Phased className="bg-ice py-20 text-night lg:py-28">
                <Glow side="left" light />
                <div className={`${sectionShell} relative grid items-center gap-12 lg:grid-cols-[minmax(0,480px)_1fr] lg:gap-20`}>
                    {partnerImage && (
                        <div className="ent-drift">
                            <div className="ent-viz" style={d(100)}>
                                <LineVisual
                                    slug={null}
                                    imageUrl={partnerImage}
                                    className="aspect-[4/3] w-full shadow-[0_30px_60px_-30px_rgba(5,11,26,0.7)]"
                                />
                            </div>
                        </div>
                    )}
                    <div className={partnerImage ? '' : 'lg:col-span-2'}>
                        <Title light>{t.partner_title}</Title>
                        <span className="ent-line mt-5 block h-[3px] w-20 rounded-full bg-signal-deep" />
                        <p className="ent-rise mt-7 max-w-[60ch] text-base leading-[1.8] text-[#2b3d66] sm:text-lg" style={d(200)}>
                            {t.partner_text}
                        </p>
                    </div>
                </div>
            </Phased>

            {/* Servicios: tarjetas blancas sobre azul */}
            {t.services.length > 0 && (
                <Phased className="bg-night-2 py-20 lg:py-28">
                    <Glow side="right" light={false} />
                    <div className={`${sectionShell} relative`}>
                        <ul className="grid gap-6 lg:grid-cols-3">
                            {t.services.map((service, i) => (
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
                                                    className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-signal"
                                                />
                                            )}
                                            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,40,92,0.5),transparent_55%)]" />
                                        </div>
                                        <div className="flex flex-1 flex-col p-7">
                                            <h2 className="font-display text-base uppercase leading-snug text-night sm:text-lg">{service.title}</h2>
                                            {service.summary && <p className="mt-3 text-sm leading-relaxed text-[#2b3d66]">{service.summary}</p>}
                                            {service.points.length > 0 && (
                                                <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#2b3d66]">
                                                    {service.points.map((point, k) => (
                                                        <li key={`${point}-${k}`} className="flex gap-3">
                                                            <Check index={k} light />
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <span aria-hidden="true" className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal-deep" />
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            {/* Bloques de información */}
            {t.blocks.map((block, i) => {
                const light = i % 2 === 1;

                return (
                    <Phased key={block.id} className={`py-20 lg:py-24 ${light ? 'bg-ice text-night' : 'bg-night text-white'}`}>
                        <Glow side={light ? 'left' : 'right'} light={light} />
                        <div className={`${sectionShell} relative grid items-center gap-10 lg:gap-20 ${block.imageUrl ? 'lg:grid-cols-2' : ''}`}>
                            {block.imageUrl && (
                                <div className={`ent-drift ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                                    <div className="ent-viz" style={d(100)}>
                                        <LineVisual
                                            slug={null}
                                            imageUrl={block.imageUrl}
                                            className="aspect-[4/3] w-full shadow-[0_30px_60px_-30px_rgba(5,11,26,0.7)]"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <Title light={light}>{block.title}</Title>
                                <span className={`ent-line mt-5 block h-[3px] w-20 rounded-full ${light ? 'bg-signal-deep' : 'bg-signal'}`} />
                                {block.body && (
                                    <p
                                        className={`ent-rise mt-6 max-w-[60ch] whitespace-pre-line text-base leading-[1.8] ${light ? 'text-[#2b3d66]' : 'text-white'}`}
                                        style={d(180)}
                                    >
                                        {block.body}
                                    </p>
                                )}
                                {block.points.length > 0 && (
                                    <ul className={`mt-6 space-y-3 text-[15px] leading-relaxed ${light ? 'text-[#2b3d66]' : 'text-white'}`}>
                                        {block.points.map((point, k) => (
                                            <li key={`${point}-${k}`} className="ent-rise flex gap-3" style={d(280 + k * 110)}>
                                                <Check index={k} light={light} />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {block.url && (
                                    <div className="ent-rise" style={d(500)}>
                                        <a
                                            href={block.url}
                                            className={`group relative mt-8 inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full px-7 text-sm font-semibold transition-colors ${
                                                light ? 'bg-night text-white' : 'bg-signal text-night hover:bg-white'
                                            }`}
                                        >
                                            {light && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute inset-0 origin-left scale-x-0 bg-signal-deep transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
                                                />
                                            )}
                                            <span className="relative">{block.label || 'Conocer más'}</span>
                                            <span className="relative transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
                                                <Arrow />
                                            </span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Phased>
                );
            })}

            {/* Valores: banda clara con tarjetas blancas */}
            {t.values.length > 0 && (
                <Phased className="bg-ice py-20 text-night lg:py-28">
                    <Glow side="right" light />
                    <div className={`${sectionShell} relative`}>
                        <div className="mx-auto max-w-[56ch] text-center">
                            <Title light>{t.values_title}</Title>
                            <span className="ent-line mx-auto mt-5 block h-[3px] w-20 rounded-full bg-signal-deep" />
                            {t.values_intro && (
                                <p className="ent-rise mt-5 text-base leading-relaxed text-[#2b3d66]" style={d(160)}>
                                    {t.values_intro}
                                </p>
                            )}
                        </div>
                        <ul className="mt-14 grid gap-6 md:grid-cols-3">
                            {t.values.map((value, i) => (
                                <li key={value.id} className="ent-rise" style={d(250 + i * 140)}>
                                    <article className="inc-card group relative h-full overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_-26px_rgba(17,40,92,0.55)] ring-1 ring-night/10">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-night">
                                            {value.imageUrl ? (
                                                <img
                                                    src={value.imageUrl}
                                                    alt=""
                                                    loading="lazy"
                                                    className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                                                />
                                            ) : (
                                                <Pictogram
                                                    slug={valueIcons[i % valueIcons.length]}
                                                    strokeWidth={1}
                                                    className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-signal"
                                                />
                                            )}
                                            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,40,92,0.55),transparent_50%)]" />
                                        </div>
                                        <div className="p-7">
                                            <h3 className="font-display text-base uppercase leading-snug text-night">{value.title}</h3>
                                            {value.body && <p className="mt-3 text-sm leading-relaxed text-[#2b3d66]">{value.body}</p>}
                                        </div>
                                        <span aria-hidden="true" className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal-deep" />
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            {t.gallery.length > 0 && (
                <Phased className="bg-night-2 py-20 lg:py-28">
                    <div className={sectionShell}>
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {t.gallery.map((item, i) => (
                                <li key={item.id} className="ent-rise" style={d((i % 3) * 120)}>
                                    <figure className="group">
                                        {item.imageUrl && (
                                            <div className="overflow-hidden rounded-lg">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.caption}
                                                    loading="lazy"
                                                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        {item.caption && <figcaption className="mt-3 text-sm leading-relaxed text-white">{item.caption}</figcaption>}
                                    </figure>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            <CtaBand title={t.cta_title} />
        </SiteLayout>
    );
}
