import type { BlogCard } from '@/types';
import { Reveal } from './reveal';

/** Tarjeta de publicación: portada, título y una línea con categoría y fecha. */
export function PostCard({ post, delay = 0 }: { post: BlogCard; delay?: number }) {
    return (
        <Reveal delay={delay} className="h-full">
            <a
                href={post.url}
                className="group flex h-full flex-col overflow-hidden bg-night transition-colors duration-300 hover:bg-[#081530]"
            >
                <span className="relative block aspect-[16/10] overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#0b2f78_0%,#071a45_55%,#050b1a_100%)]">
                    {post.coverUrl ? (
                        <img
                            src={post.coverUrl}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                        />
                    ) : (
                        <img
                            src="/brand/logo-light.png"
                            alt=""
                            className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 opacity-40"
                        />
                    )}
                </span>
                <span className="flex flex-1 flex-col p-6">
                    <span className="font-display text-base uppercase leading-snug text-white sm:text-[1.05rem]">
                        {post.title}
                    </span>
                    <span className="mt-3 text-xs text-signal">
                        {post.category.name}
                        {post.date ? ` · ${post.date}` : ''}
                    </span>
                    {post.excerpt && (
                        <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/65">{post.excerpt}</span>
                    )}
                </span>
            </a>
        </Reveal>
    );
}
