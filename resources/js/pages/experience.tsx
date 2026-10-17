import type { CSSProperties } from 'react';
import { CtaBand } from '@/components/site/cta-band';
import { LogoMarquee } from '@/components/site/logo-marquee';
import { PageHero } from '@/components/site/page-hero';
import { Phased, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { HomeContent } from '@/types';

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

function Title({ light, children }: { light?: boolean; children: string }) {
    return (
        <>
            <h2
                className={`ent-rise font-display text-[clamp(1.25rem,2.6vw,2.2rem)] leading-[1.14] uppercase text-balance ${light ? 'text-night' : 'text-white'}`}
                style={d(0)}
            >
                {children}
            </h2>
            <span className={`ent-line mt-5 block h-[3px] w-20 rounded-full ${light ? 'bg-signal-deep' : 'bg-signal'}`} />
        </>
    );
}

/** Ondas que se expanden detrás del logo del cliente. */
function Rings() {
    return (
        <svg aria-hidden="true" viewBox="0 0 200 200" fill="none" className="absolute left-1/2 top-1/2 size-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 text-signal">
            {[0, 1, 2].map((k) => (
                <circle key={k} className="viz-pulse" style={{ ['--i' as string]: k } as CSSProperties} cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" />
            ))}
        </svg>
    );
}

export default function Experience({ home }: { home: HomeContent }) {
    const e = home.sections.experience;
    const clients = home.sections.clients;
    const clientLogos = clients.items.filter((c) => c.logoUrl).map((c) => ({ name: c.name, url: c.logoUrl as string }));
    const half = Math.ceil(clientLogos.length / 2);

    const jumps = [
        e.cases.length > 0 && { id: 'proyectos', label: 'Proyectos' },
        e.certifications.length > 0 && { id: 'certificaciones', label: 'Certificaciones' },
        clientLogos.length > 0 && { id: 'clientes', label: 'Clientes' },
    ].filter(Boolean) as { id: string; label: string }[];

    return (
        <SiteLayout home={home} title={e.title} description={e.intro}>
            <PageHero title={e.title} intro={e.intro} imageUrl={e.bgUrl} />

            {/* Salto rápido entre bloques */}
            {jumps.length > 1 && (
                <nav aria-label="En esta página" className="bg-ice pt-8">
                    <ul className={`${sectionShell} flex flex-wrap gap-3`}>
                        {jumps.map((jump) => (
                            <li key={jump.id}>
                                <a
                                    href={`#${jump.id}`}
                                    className="inline-flex min-h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-night shadow-[0_10px_24px_-16px_rgba(17,40,92,0.55)] ring-1 ring-night/10 transition-[transform,background-color,color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-night hover:text-white"
                                >
                                    {jump.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* Proyectos: línea de tiempo con fichas blancas */}
            {e.cases.length > 0 && (
                <Phased className="scroll-mt-20 bg-ice py-16 text-night lg:py-24">
                    <span id="proyectos" className="absolute -top-20" />
                    <div aria-hidden="true" className="ent-glow absolute -left-32 top-0 size-[28rem] rounded-full bg-signal/25 blur-3xl" />
                    <div className={`${sectionShell} relative`}>
                        <Title light>Proyectos</Title>

                        <ul className="relative mt-12 grid gap-8 lg:pl-14">
                            <span aria-hidden="true" className="absolute bottom-6 left-[0.7rem] top-6 hidden w-px bg-night/15 lg:block" />
                            <span aria-hidden="true" className="tl-line absolute bottom-6 left-[0.65rem] top-6 hidden w-[3px] rounded-full bg-signal-deep lg:block" />

                            {e.cases.map((c, i) => (
                                <li key={c.id} className="ent-rise relative" style={d(200 + i * 160)}>
                                    <span
                                        aria-hidden="true"
                                        className="absolute -left-14 top-9 hidden size-6 items-center justify-center lg:flex"
                                    >
                                        <span className="viz-pulse absolute size-6 rounded-full bg-signal-deep/40" style={{ ['--i' as string]: i } as CSSProperties} />
                                        <span className="relative size-3.5 rounded-full border-2 border-white bg-signal-deep shadow" />
                                    </span>

                                    <article className="inc-card group relative grid overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_-26px_rgba(17,40,92,0.55)] ring-1 ring-night/10 md:grid-cols-[240px_1fr]">
                                        <div className="relative flex min-h-44 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#1f4fb0_0%,#17358a_55%,#11285c_100%)] p-8">
                                            <Rings />
                                            <div className="relative flex h-24 w-40 items-center justify-center rounded-lg bg-white p-4 shadow-[0_16px_30px_-16px_rgba(5,11,26,0.8)] transition-transform duration-500 ease-out-expo group-hover:scale-105">
                                                {c.imageUrl ? (
                                                    <img src={c.imageUrl} alt={`Logo de ${c.client}`} loading="lazy" className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <span className="text-center font-display text-xs uppercase text-night">{c.client}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col p-6 sm:p-8">
                                            <h3 className="font-display text-lg uppercase leading-snug text-night sm:text-xl">{c.client}</h3>
                                            {c.summary && <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed text-[#2b3d66]">{c.summary}</p>}
                                            {c.gallery.length > 0 && (
                                                <div className="mt-auto pt-6">
                                                    <p className="mb-3 text-xs font-semibold text-signal-deep">Tecnologías</p>
                                                    <ul className="flex flex-wrap gap-2">
                                                        {c.gallery.map((logo, k) => (
                                                            <li
                                                                key={`${logo.name}-${k}`}
                                                                className="flex h-12 w-24 items-center justify-center rounded-md bg-white p-2 ring-1 ring-night/10 transition-transform duration-300 ease-out-expo hover:-translate-y-1"
                                                            >
                                                                <img src={logo.url} alt={logo.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
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

            {/* Certificaciones: fichas que aparecen con escala */}
            {e.certifications.length > 0 && (
                <Phased className="scroll-mt-20 bg-night-2 py-16 lg:py-24">
                    <span id="certificaciones" className="absolute -top-20" />
                    <div aria-hidden="true" className="ent-glow absolute -right-32 bottom-0 size-[28rem] rounded-full bg-signal-deep/45 blur-3xl" />
                    <div className={`${sectionShell} relative`}>
                        <Title>Certificaciones</Title>
                        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {e.certifications.map((cert, i) => (
                                <li key={cert.id} className="ent-pop" style={d(150 + i * 80)}>
                                    <figure className="group">
                                        <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-5 shadow-[0_18px_36px_-22px_rgba(5,11,26,0.9)] transition-[transform,box-shadow] duration-500 ease-out-expo group-hover:-translate-y-1.5 group-hover:rotate-1 group-hover:shadow-[0_26px_44px_-20px_rgba(6,194,240,0.55)]">
                                            {cert.imageUrl ? (
                                                <img src={cert.imageUrl} alt={cert.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                                            ) : (
                                                <span className="text-center text-sm font-medium text-night">{cert.name}</span>
                                            )}
                                        </div>
                                    </figure>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            {/* Clientes: marquesina en dos sentidos */}
            {clientLogos.length > 0 && (
                <Phased className="scroll-mt-20 bg-ice py-16 text-night lg:py-24">
                    <span id="clientes" className="absolute -top-20" />
                    <div className={`${sectionShell} relative`}>
                        <Title light>{`${clients.title} ${clients.accent}`.trim()}</Title>
                    </div>
                    <div className="ent-rise relative mt-12 space-y-3" style={d(200)}>
                        {clientLogos.length > 8 ? (
                            <>
                                <LogoMarquee logos={clientLogos.slice(0, half)} ring />
                                <LogoMarquee logos={clientLogos.slice(half)} reverse ring />
                            </>
                        ) : (
                            <LogoMarquee logos={clientLogos} ring />
                        )}
                    </div>
                </Phased>
            )}

            <CtaBand title="Tu proyecto puede ser el siguiente" text="Conversemos sobre lo que necesitas." />
        </SiteLayout>
    );
}
