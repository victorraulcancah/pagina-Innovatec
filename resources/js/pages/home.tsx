import { AboutSection } from '@/components/site/about-section';
import { ClientsTeaser } from '@/components/site/clients-section';
import { CtaBand } from '@/components/site/cta-band';
import { ExperienceTeaser } from '@/components/site/experience-section';
import { Hero } from '@/components/site/hero';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { SolutionCards } from '@/components/site/solution-cards';
import { PostCard } from '@/components/site/post-card';
import type { BlogCard, HomeContent } from '@/types';

export default function Home({ home, latestPosts }: { home: HomeContent; latestPosts: BlogCard[] }) {
    const s = home.sections;

    return (
        <SiteLayout home={home} title="Inicio" description={home.subtitle ?? home.title}>
            <Hero home={home} />
            <AboutSection about={s.about} />

            {s.solutions.items.length > 0 && (
                <section className="bg-night-2 py-24 lg:py-32">
                    <div className={sectionShell}>
                        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <SectionHeading title={s.enterprise.title} />
                                {s.enterprise.subtitle && (
                                    <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-white/70">{s.enterprise.subtitle}</p>
                                )}
                            </div>
                            <a href="/division-enterprise" className="text-sm font-medium text-signal underline-offset-4 hover:underline">
                                Ver la división →
                            </a>
                        </Reveal>
                        <SolutionCards items={s.solutions.items} className="mt-14" />
                    </div>
                </section>
            )}

            <section className="bg-night py-24 lg:py-28">
                <div className={`${sectionShell} grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20`}>
                    <Reveal>
                        <SectionHeading title={s.telcos.title} />
                        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg">{s.telcos.subtitle}</p>
                    </Reveal>
                    <Reveal delay={100}>
                        <a
                            href="/division-telcos"
                            className="inline-flex min-h-12 items-center rounded-full border border-white/70 px-8 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-night"
                        >
                            Conoce la división
                        </a>
                    </Reveal>
                </div>
            </section>

            <ExperienceTeaser experience={s.experience} />
            <ClientsTeaser clients={s.clients} />

            {latestPosts.length > 0 && (
                <section className="bg-night py-24 lg:py-32">
                    <div className={sectionShell}>
                        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <SectionHeading title="Últimas publicaciones" />
                            <a href="/blog" className="text-sm font-medium text-signal underline-offset-4 hover:underline">
                                Ver el blog →
                            </a>
                        </Reveal>
                        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {latestPosts.map((post, i) => (
                                <li key={post.id}>
                                    <PostCard post={post} delay={i * 90} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <CtaBand title={s.contact.title} text={s.contact.body} />
        </SiteLayout>
    );
}
