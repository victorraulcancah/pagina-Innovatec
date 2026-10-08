import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { PostBody } from '@/components/site/post-body';
import { PostCard } from '@/components/site/post-card';
import { Reveal, SectionHeading, sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { BlogCard, HomeContent } from '@/types';

export default function BlogPost({
    home,
    post,
    related,
}: {
    home: HomeContent;
    post: BlogCard & { body: string };
    related: BlogCard[];
}) {
    return (
        <SiteLayout home={home} title={post.title} description={post.excerpt}>
            <PageHero title={post.title} imageUrl={post.coverUrl} />

            <article className="bg-night py-16 lg:py-24">
                <div className={`${sectionShell} max-w-[860px]`}>
                    <p className="mb-10 flex flex-wrap items-center gap-x-3 border-b border-white/15 pb-6 text-sm text-white/60">
                        <a href={post.category.url} className="font-medium text-signal hover:underline">
                            {post.category.name}
                        </a>
                        {post.date && <span>{post.date}</span>}
                    </p>
                    {post.excerpt && <p className="mb-8 text-xl leading-relaxed text-white">{post.excerpt}</p>}
                    <PostBody text={post.body} />
                    <a href="/blog" className="mt-14 inline-block text-sm text-signal hover:underline">
                        ← Volver al blog
                    </a>
                </div>
            </article>

            {related.length > 0 && (
                <section className="bg-night-2 py-16 lg:py-24">
                    <div className={sectionShell}>
                        <Reveal>
                            <SectionHeading title="Más publicaciones" className="!text-[clamp(1.25rem,2.4vw,2rem)]" />
                        </Reveal>
                        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((p, i) => (
                                <li key={p.id}>
                                    <PostCard post={p} delay={i * 90} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <CtaBand title="¿Quieres conversar sobre tu proyecto?" />
        </SiteLayout>
    );
}
