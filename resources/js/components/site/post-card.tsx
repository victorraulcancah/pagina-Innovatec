import type { BlogCard } from '@/types';
import { trackPointer } from './motion';
import { Reveal } from './reveal';

function Arrow() {
    return (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 6v8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

/** Tarjeta de publicación: portada, título y una línea con categoría y fecha. */
export function PostCard({ post, delay = 0 }: { post: BlogCard; delay?: number }) {
    return (
        <Reveal delay={delay} className="h-full">
            <a
                href={post.url}
                onPointerMove={trackPointer}
                className="card-spot group flex h-full flex-col overflow-hidden bg-night transition-colors duration-300 hover:bg-[#081530]"
            >
                <span className="relative block aspect-[16/10] overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#1f4fb0_0%,#17358a_55%,#11285c_100%)]">
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
                    <span
                        aria-hidden="true"
                        className="absolute bottom-0 right-0 flex size-10 translate-y-2 items-center justify-center bg-signal text-night opacity-0 transition-[opacity,transform] duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100"
                    >
                        <Arrow />
                    </span>
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
                        <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-white">{post.excerpt}</span>
                    )}
                </span>
            </a>
        </Reveal>
    );
}
