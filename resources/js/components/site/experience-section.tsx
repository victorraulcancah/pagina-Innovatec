import type { SiteSections } from '@/types';
import { Reveal, SectionHeading, sectionShell } from './reveal';

export function ExperienceSection({ experience }: { experience: SiteSections['experience'] }) {
    const { cases, certifications } = experience;

    return (
        <section id="experiencia" className="relative isolate scroll-mt-20 overflow-hidden bg-night py-24 lg:py-32">
            {experience.bgUrl && (
                <img
                    src={experience.bgUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 -z-20 size-full object-cover grayscale"
                />
            )}
            <div className="absolute inset-0 -z-10 bg-night/85" aria-hidden="true" />

            <div className={sectionShell}>
                <div className="grid gap-12 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-start lg:gap-20">
                    <Reveal>
                        <SectionHeading title={experience.title} />
                        {experience.intro && (
                            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-white/75 sm:text-lg">
                                {experience.intro}
                            </p>
                        )}
                    </Reveal>

                    {certifications.length > 0 && (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {certifications.map((cert, i) => (
                                <li key={cert.id}>
                                    <Reveal delay={i * 60}>
                                        <figure className="flex aspect-square flex-col items-center justify-center rounded-md bg-white p-3">
                                            {cert.imageUrl && (
                                                <img
                                                    src={cert.imageUrl}
                                                    alt={cert.name}
                                                    loading="lazy"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            )}
                                        </figure>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cases.length > 0 && (
                    <ul className="mt-20 grid gap-x-16 gap-y-12 md:grid-cols-2">
                        {cases.map((c) => (
                            <li key={c.id} className="border-t border-white/25 pt-6">
                                <Reveal>
                                    <h3 className="font-display text-base uppercase text-signal sm:text-lg">
                                        {c.client}
                                    </h3>
                                    {c.summary && (
                                        <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-white/75">
                                            {c.summary}
                                        </p>
                                    )}
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
