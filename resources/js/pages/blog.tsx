import { Link } from '@inertiajs/react';
import { CtaBand } from '@/components/site/cta-band';
import { PageHero } from '@/components/site/page-hero';
import { PostCard } from '@/components/site/post-card';
import { sectionShell } from '@/components/site/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import type { BlogCard, HomeContent } from '@/types';

type Paginated = {
    data: BlogCard[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function Blog({
    home,
    categories,
    current,
    posts,
}: {
    home: HomeContent;
    categories: { name: string; url: string; slug: string }[];
    current: { name: string; slug: string } | null;
    posts: Paginated;
}) {
    const tab = (active: boolean) =>
        `whitespace-nowrap border-b-2 px-1 pb-3 text-sm transition-colors ${
            active ? 'border-signal text-white' : 'border-transparent text-white/60 hover:text-white'
        }`;

    return (
        <SiteLayout
            home={home}
            title={current ? `Blog · ${current.name}` : 'Blog'}
            description="Novedades, eventos y tendencias del mundo de las tecnologías de la información y comunicaciones."
        >
            <PageHero
                title={current ? current.name : 'Blog'}
                intro="Novedades, eventos y tendencias del mundo TIC."
            />

            <section className="bg-night-2 py-16 lg:py-24">
                <div className={sectionShell}>
                    <nav aria-label="Categorías del blog" className="mb-12 overflow-x-auto overflow-y-hidden border-b border-white/15">
                        <ul className="flex gap-8">
                            <li>
                                <Link href="/blog" className={tab(!current)} aria-current={!current ? 'page' : undefined}>
                                    Todas
                                </Link>
                            </li>
                            {categories.map((c) => (
                                <li key={c.slug}>
                                    <Link
                                        href={c.url}
                                        className={tab(current?.slug === c.slug)}
                                        aria-current={current?.slug === c.slug ? 'page' : undefined}
                                    >
                                        {c.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {posts.data.length === 0 ? (
                        <p className="border border-dashed border-white/20 px-6 py-16 text-center text-white/70">
                            Todavía no hay publicaciones{current ? ` en ${current.name}` : ''}. Vuelve pronto.
                        </p>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post, i) => (
                                <li key={post.id}>
                                    <PostCard post={post} delay={(i % 3) * 90} />
                                </li>
                            ))}
                        </ul>
                    )}

                    {posts.last_page > 1 && (
                        <nav aria-label="Páginas" className="mt-12 flex items-center justify-between text-sm">
                            {posts.prev_page_url ? (
                                <Link href={posts.prev_page_url} className="text-signal hover:underline">
                                    ← Anteriores
                                </Link>
                            ) : (
                                <span />
                            )}
                            <span className="text-white/55">
                                Página {posts.current_page} de {posts.last_page}
                            </span>
                            {posts.next_page_url ? (
                                <Link href={posts.next_page_url} className="text-signal hover:underline">
                                    Siguientes →
                                </Link>
                            ) : (
                                <span />
                            )}
                        </nav>
                    )}
                </div>
            </section>

            <CtaBand title="¿Quieres conversar sobre tu proyecto?" />
        </SiteLayout>
    );
}
