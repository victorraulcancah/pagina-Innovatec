import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

type Experience = SiteSections['experience'];
type Case = Experience['cases'][number];

/** Un proyecto en la portada: logo del cliente, su nombre y el inicio del resumen. */
function CaseCard({ item }: { item: Case }) {
    return (
        <article className="inc-card group relative h-full overflow-hidden rounded-xl bg-white/[0.07] p-5 ring-1 ring-white/15 hover:bg-white/[0.11]">
            <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-[0_10px_20px_-12px_rgba(5,11,26,0.8)] ring-1 ring-night/10">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt=""
                            loading="lazy"
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-center text-[10px] leading-tight font-semibold text-night">
                            {item.client}
                        </span>
                    )}
                </span>
                <h3 className="min-w-0 text-sm leading-snug font-semibold text-white">
                    {item.client}
                </h3>
            </div>
            {item.summary && (
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-white">
                    {item.summary}
                </p>
            )}
            <span
                aria-hidden="true"
                className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal"
            />
        </article>
    );
}

/** Versión de portada: título, primeros proyectos y enlace a la página Casos de éxito. */
export function ExperienceTeaser({ experience }: { experience: Experience }) {
    if (experience.cases.length === 0) {
        return null;
    }

    return (
        <section className="relative isolate overflow-hidden bg-night py-24 lg:py-32">
            {experience.bgUrl && (
                <img
                    src={experience.bgUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 -z-20 size-full object-cover grayscale"
                />
            )}
            <div
                className="absolute inset-0 -z-10 bg-night/85"
                aria-hidden="true"
            />

            <div
                className={`${sectionShell} grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center lg:gap-16`}
            >
                <Reveal>
                    <SectionHeading title={experience.title} />
                    {experience.intro && (
                        <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-white sm:text-lg">
                            {experience.intro}
                        </p>
                    )}
                    <a
                        href="/experiencia"
                        className="mt-9 inline-flex min-h-11 items-center rounded-full border border-white/70 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night"
                    >
                        Ver proyectos
                    </a>
                </Reveal>
                <Reveal delay={100}>
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {experience.cases.slice(0, 4).map((item) => (
                            <li key={item.id}>
                                <CaseCard item={item} />
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}
