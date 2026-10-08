import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

type Experience = SiteSections['experience'];

/** Insignias de certificación sobre fichas claras. */
export function CertificationGrid({ items }: { items: Experience['certifications'] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((cert, i) => (
                <li key={cert.id}>
                    <Reveal delay={(i % 4) * 60}>
                        <figure className="flex aspect-square flex-col items-center justify-center rounded-md bg-white p-3">
                            {cert.imageUrl && (
                                <img src={cert.imageUrl} alt={cert.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                            )}
                        </figure>
                    </Reveal>
                </li>
            ))}
        </ul>
    );
}

/** Proyectos realizados, en dos columnas con filete superior. */
export function CaseList({ items }: { items: Experience['cases'] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <ul className="grid gap-x-16 gap-y-12 md:grid-cols-2">
            {items.map((c) => (
                <li key={c.id} className="border-t border-white/25 pt-6">
                    <Reveal>
                        <h3 className="font-display text-base uppercase text-signal sm:text-lg">{c.client}</h3>
                        {c.summary && (
                            <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-white/75">{c.summary}</p>
                        )}
                    </Reveal>
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
                        <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-white/75 sm:text-lg">{experience.intro}</p>
                    )}
                    <a
                        href="/experiencia"
                        className="mt-9 inline-flex min-h-11 items-center rounded-full border border-white/70 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night"
                    >
                        Ver proyectos
                    </a>
                </Reveal>
                <CertificationGrid items={experience.certifications.slice(0, 8)} />
            </div>
        </section>
    );
}
