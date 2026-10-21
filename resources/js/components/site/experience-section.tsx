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
                        <figure className="tile-lift flex aspect-square flex-col items-center justify-center rounded-md bg-white p-3">
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
                <CertificationGrid items={experience.certifications.slice(0, 8)} />
            </div>
        </section>
    );
}
