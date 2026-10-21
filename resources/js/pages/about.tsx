import { Fragment, type CSSProperties } from 'react';
import { CtaBand } from '@/components/site/cta-band';
import { LineVisual } from '@/components/site/line-visual';
import { LogoMarquee } from '@/components/site/logo-marquee';
import { PageHero } from '@/components/site/page-hero';
import { Phased, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import type { HomeContent } from '@/types';

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties;

/** Titular que sube palabra por palabra al entrar la sección. */
function Title({ light, children, center = false }: { light?: boolean; children: string; center?: boolean }) {
    return (
        <>
            <h2
                className={`font-display text-[clamp(1.25rem,2.6vw,2.2rem)] leading-[1.14] uppercase text-balance ${light ? 'text-night' : 'text-white'} ${center ? 'text-center' : ''}`}
            >
                {children.split(/\s+/).map((word, i) => (
                    <Fragment key={`${word}-${i}`}>
                        {i > 0 && ' '}
                        <span className="ent-word" style={{ ['--i' as string]: i } as CSSProperties}>
                            {word}
                        </span>
                    </Fragment>
                ))}
            </h2>
            <span className={`ent-line mt-5 block h-[3px] w-20 rounded-full ${light ? 'bg-signal-deep' : 'bg-signal'} ${center ? 'mx-auto' : ''}`} />
        </>
    );
}

/** Sello circular con el nombre de la marca girando alrededor del icono. */
function Seal({ text }: { text: string }) {
    const ring = `${text.toUpperCase()} · ${text.toUpperCase()} · `;

    return (
        <div className="relative flex size-36 items-center justify-center rounded-full bg-night shadow-[0_24px_44px_-18px_rgba(17,40,92,0.9)] ring-4 ring-ice sm:size-40">
            <svg viewBox="0 0 160 160" aria-hidden="true" className="viz-spin absolute inset-0 size-full text-signal" style={{ transformOrigin: '80px 80px', transformBox: 'view-box', animationDuration: '30s' }}>
                <defs>
                    <path id="seal-ring" d="M80 80m-62 0a62 62 0 1 1 124 0a62 62 0 1 1-124 0" />
                </defs>
                <text fill="currentColor" fontSize="10.5" fontWeight="600" letterSpacing="2.6">
                    <textPath href="#seal-ring">{ring}</textPath>
                </text>
            </svg>
            <img src="/brand/icon.png" alt="" className="relative size-14 object-contain sm:size-16" />
        </div>
    );
}

/** Iconos de línea de Misión, Visión y Objetivos (se dibujan al entrar). */
function PillarGlyph({ kind }: { kind: 'mission' | 'vision' | 'objectives' }) {
    const common = {
        width: 34,
        height: 34,
        viewBox: '0 0 48 48',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
        className: 'inc-glyph',
    };

    if (kind === 'mission') {
        return (
            <svg {...common}>
                <circle pathLength={1} cx="22" cy="26" r="16" />
                <circle pathLength={1} cx="22" cy="26" r="8" />
                <path pathLength={1} d="M22 26L40 8M33 8h7v7" />
            </svg>
        );
    }

    if (kind === 'vision') {
        return (
            <svg {...common}>
                <path pathLength={1} d="M3 24s7.500-14 21-14 21 14 21 14-7.500 14-21 14S3 24 3 24z" />
                <circle pathLength={1} cx="24" cy="24" r="6" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <path pathLength={1} d="M10 6v38" />
            <path pathLength={1} d="M10 8h26l-5 8 5 8H10" />
        </svg>
    );
}

/** Divide la historia en frase inicial, desarrollo y frase final para darle jerarquía. */
function splitStory(story: string) {
    const sentences = story.replace(/\r\n/g, '\n').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

    if (sentences.length < 3) {
        return { lead: sentences[0] ?? '', middle: sentences.slice(1).join(' '), closing: '' };
    }

    return {
        lead: sentences[0],
        middle: sentences.slice(1, -1).join(' '),
        closing: sentences[sentences.length - 1],
    };
}

export default function About({ home }: { home: HomeContent }) {
    const { about, experience, solutions, clients } = home.sections;
    const image = about.imageUrl ?? about.cards[0]?.imageUrl ?? null;
    const story = splitStory(about.story);
    const lines = (text: string) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const pillars = (
        [
            { kind: 'mission', title: 'Misión', lines: lines(about.mission ?? ''), imageUrl: about.missionImageUrl },
            { kind: 'vision', title: 'Visión', lines: lines(about.vision ?? ''), imageUrl: about.visionImageUrl },
            { kind: 'objectives', title: 'Objetivos', lines: lines(about.objectives ?? ''), imageUrl: about.objectivesImageUrl },
        ] as const
    ).filter((p) => p.lines.length > 0);
    const clientLogos = clients.items.filter((c) => c.logoUrl).map((c) => ({ name: c.name, url: c.logoUrl as string }));
    const half = Math.ceil(clientLogos.length / 2);

    return (
        <SiteLayout home={home} title="Nosotros" description={about.body}>
            <PageHero title={`${about.title} ${about.accent}`.trim()} imageUrl={image} />

            {/* Quiénes somos */}
            <Phased className="bg-ice py-20 text-night lg:py-28">
                <div aria-hidden="true" className="ent-glow absolute -left-32 top-0 size-[28rem] rounded-full bg-signal/25 blur-3xl" />
                <div aria-hidden="true" className="about-dots absolute inset-0 [background-image:radial-gradient(circle,rgba(17,40,92,0.14)_1px,transparent_1.6px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_70%_at_20%_40%,black,transparent_75%)]" />

                <div className={`${sectionShell} relative grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20`}>
                    <div className="ent-drift relative mx-auto w-full max-w-[520px] lg:mx-0">
                        <div className="ent-viz" style={d(100)}>
                            <LineVisual
                                slug={null}
                                imageUrl={image}
                                className="aspect-[4/5] w-full shadow-[0_30px_60px_-30px_rgba(5,11,26,0.7)]"
                            />
                        </div>
                        <div className="ent-pop absolute -bottom-10 -right-4 sm:-right-8" style={d(600)}>
                            <Seal text={home.brandName} />
                        </div>
                    </div>

                    <div>
                        <Title light>Quiénes somos</Title>
                        {story.lead && (
                            <p className="ent-rise mt-8 max-w-[34ch] font-display text-[clamp(1.1rem,2vw,1.55rem)] leading-snug text-night" style={d(200)}>
                                {story.lead}
                            </p>
                        )}
                        {story.middle && (
                            <p className="ent-rise mt-6 max-w-[62ch] text-base leading-[1.85] text-[#2b3d66] sm:text-lg" style={d(320)}>
                                {story.middle}
                            </p>
                        )}
                        {story.closing && (
                            <blockquote
                                className="ent-rise relative mt-8 max-w-[58ch] rounded-xl bg-white p-6 pl-16 text-base leading-relaxed text-night shadow-[0_18px_40px_-26px_rgba(17,40,92,0.55)] ring-1 ring-night/10"
                                style={d(440)}
                            >
                                <svg aria-hidden="true" width="30" height="30" viewBox="0 0 32 32" fill="none" className="absolute left-5 top-5 text-signal-deep">
                                    <path d="M4 20c0-6 3-10 9-12M18 20c0-6 3-10 9-12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                                    <path d="M4 20h7v6H4zM18 20h7v6h-7z" fill="currentColor" />
                                </svg>
                                {story.closing}
                            </blockquote>
                        )}
                    </div>
                </div>
            </Phased>

            {/* Misión, Visión y Objetivos: filas con texto e imagen alternados; solo si hay texto cargado */}
            {pillars.length > 0 && (
                <Phased className="bg-night py-20 lg:py-28">
                    <div aria-hidden="true" className="ent-glow absolute -right-32 top-0 size-[28rem] rounded-full bg-signal-deep/45 blur-3xl" />
                    <div className={`${sectionShell} relative`}>
                        <ul>
                            {pillars.map((pillar, i) => (
                                <li key={pillar.kind} className="relative py-12 first:pt-0 last:pb-0 lg:py-16 lg:first:pt-0 lg:last:pb-0">
                                    {i > 0 && <span aria-hidden="true" className="ent-line absolute inset-x-0 top-0 block h-px bg-white/20" />}
                                    <div className={`grid items-center gap-10 lg:gap-20 ${pillar.imageUrl ? 'lg:grid-cols-2' : ''}`}>
                                        <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                                            <div className="ent-rise flex items-center gap-4" style={d(0)}>
                                                <span className="inc-card inc-tile flex size-14 shrink-0 items-center justify-center rounded-lg bg-white text-signal-deep shadow-[0_14px_28px_-14px_rgba(5,11,26,0.9)]">
                                                    <PillarGlyph kind={pillar.kind} />
                                                </span>
                                                <h2 className="font-display text-[clamp(1.4rem,2.8vw,2.2rem)] uppercase leading-snug text-white">{pillar.title}</h2>
                                            </div>
                                            <span className="ent-line mt-5 block h-[3px] w-20 rounded-full bg-signal" />
                                            {pillar.lines.length > 1 ? (
                                                <ul className="mt-7 max-w-[60ch] space-y-4 text-base leading-relaxed text-white sm:text-lg">
                                                    {pillar.lines.map((line, k) => (
                                                        <li key={`${line}-${k}`} className="ent-rise flex gap-3" style={d(200 + k * 120)}>
                                                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="inc-glyph mt-1 shrink-0 text-signal" style={d(300 + k * 120)}>
                                                                <path pathLength={1} d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>{line}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ent-rise mt-7 max-w-[60ch] text-base leading-[1.85] text-white sm:text-lg" style={d(220)}>
                                                    {pillar.lines[0]}
                                                </p>
                                            )}
                                        </div>

                                        {pillar.imageUrl && (
                                            <div className={`ent-drift ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                                                <div className="ent-viz" style={d(150)}>
                                                    <LineVisual
                                                        slug={null}
                                                        imageUrl={pillar.imageUrl}
                                                        className="aspect-[4/3] w-full shadow-[0_30px_60px_-30px_rgba(5,11,26,0.8)]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            {/* Soluciones */}
            {solutions.items.length > 0 && (
                <Phased className="bg-ice py-20 text-night lg:py-28">
                    <div aria-hidden="true" className="ent-glow absolute -left-32 bottom-0 size-[28rem] rounded-full bg-signal/25 blur-3xl" />
                    <div className={`${sectionShell} relative`}>
                        <Title light>{solutions.title}</Title>
                        {solutions.intro && (
                            <p className="ent-rise mt-5 max-w-[56ch] text-base leading-relaxed text-[#2b3d66]" style={d(150)}>
                                {solutions.intro}
                            </p>
                        )}
                        <SolutionCards items={solutions.items} className="mt-12" />
                    </div>
                </Phased>
            )}

            {/* Certificaciones */}
            {experience.certifications.length > 0 && (
                <Phased className="bg-night-2 py-20 lg:py-28">
                    <div aria-hidden="true" className="ent-glow absolute -right-32 bottom-0 size-[28rem] rounded-full bg-signal-deep/45 blur-3xl" />
                    <div className={`${sectionShell} relative`}>
                        <Title>Certificaciones de nuestro equipo</Title>
                        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {experience.certifications.map((cert, i) => (
                                <li key={cert.id} className="ent-pop" style={d(150 + i * 80)}>
                                    <div className="group flex aspect-square items-center justify-center rounded-xl bg-white p-5 shadow-[0_18px_36px_-22px_rgba(5,11,26,0.9)] transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1.5 hover:rotate-1 hover:shadow-[0_26px_44px_-20px_rgba(6,194,240,0.55)]">
                                        {cert.imageUrl ? (
                                            <img src={cert.imageUrl} alt={cert.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="text-center text-sm font-medium text-night">{cert.name}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Phased>
            )}

            {/* Clientes */}
            {clientLogos.length > 0 && (
                <Phased className="bg-ice py-20 text-night lg:py-28">
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

            <CtaBand title="Conversemos sobre tu proyecto" text="Cuéntanos qué necesitas y te ayudamos a encontrar la solución." />
        </SiteLayout>
    );
}
