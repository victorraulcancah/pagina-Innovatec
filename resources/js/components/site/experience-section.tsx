import type { CSSProperties } from 'react';
import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

type Experience = SiteSections['experience'];

/**
 * Certificaciones: cada una con su insignia, su nombre y, si se escribió, una descripción. `tone` es el fondo donde
 * se pone (oscuro o claro); `compact` deja solo insignia y nombre (para la portada).
 */
export function CertificationGrid({
    items,
    tone = 'dark',
    compact = false,
}: {
    items: Experience['certifications'];
    tone?: 'dark' | 'light';
    compact?: boolean;
}) {
    if (items.length === 0) {
        return null;
    }

    const light = tone === 'light';

    return (
        <ul className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'}`}>
            {items.map((cert, i) => (
                <li key={cert.id} className="ent-pop" style={{ ['--d' as string]: `${150 + (i % 8) * 80}ms` } as CSSProperties}>
                    <article
                        className={`inc-card group relative flex h-full items-center gap-4 overflow-hidden rounded-xl p-4 sm:gap-5 ${
                            compact ? '' : 'sm:p-5'
                        } ${
                            light
                                ? 'bg-white shadow-[0_18px_36px_-24px_rgba(17,40,92,0.6)] ring-1 ring-night/10'
                                : 'bg-white/[0.07] ring-1 ring-white/15 hover:bg-white/[0.11]'
                        }`}
                    >
                        <span
                            className={`flex shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-[0_10px_20px_-12px_rgba(5,11,26,0.8)] ring-1 ring-night/10 transition-transform duration-500 ease-out-expo group-hover:scale-105 group-hover:-rotate-2 ${
                                compact ? 'size-16' : 'size-24'
                            }`}
                        >
                            {cert.imageUrl ? (
                                <img src={cert.imageUrl} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-center text-[10px] font-semibold leading-tight text-night">{cert.name}</span>
                            )}
                        </span>
                        <div className="min-w-0">
                            <h3 className={`font-semibold leading-snug ${compact ? 'text-sm' : 'text-base'} ${light ? 'text-night' : 'text-white'}`}>{cert.name}</h3>
                            {!compact && cert.description && (
                                <p className={`mt-1.5 text-sm leading-relaxed ${light ? 'text-[#2b3d66]' : 'text-white'}`}>{cert.description}</p>
                            )}
                        </div>
                        <span aria-hidden="true" className={`inc-bar absolute inset-x-0 bottom-0 h-[3px] ${light ? 'bg-signal-deep' : 'bg-signal'}`} />
                    </article>
                </li>
            ))}
        </ul>
    );
}

/** Versión de portada: título, certificaciones y enlace a la página Experiencia. */
export function ExperienceTeaser({ experience }: { experience: Experience }) {
    return (
        <section className="relative isolate overflow-hidden bg-night py-24 lg:py-32">
            {experience.bgUrl && (
                <img src={experience.bgUrl} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover grayscale" />
            )}
            <div className="absolute inset-0 -z-10 bg-night/85" aria-hidden="true" />

            <div className={`${sectionShell} grid gap-12 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-center lg:gap-20`}>
                <Reveal>
                    <SectionHeading title={experience.title} />
                    {experience.intro && (
                        <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-white sm:text-lg">{experience.intro}</p>
                    )}
                    <a
                        href="/experiencia"
                        className="mt-9 inline-flex min-h-11 items-center rounded-full border border-white/70 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night"
                    >
                        Ver proyectos
                    </a>
                </Reveal>
                <CertificationGrid items={experience.certifications.slice(0, 8)} compact />
            </div>
        </section>
    );
}
