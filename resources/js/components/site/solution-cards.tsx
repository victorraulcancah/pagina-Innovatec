import type { Offering } from '@/types';
import { Pictogram } from './pictogram';
import { Reveal } from './reveal';

function Arrow() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 6v8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

/** Rejilla de soluciones o servicios: cada tarjeta lleva a su página. */
export function SolutionCards({ items, className = '' }: { items: Offering[]; className?: string }) {
    return (
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
            {items.map((item, i) => (
                <li key={item.id}>
                    <Reveal delay={(i % 3) * 90} className="h-full">
                        <a
                            href={item.url}
                            className="group relative flex h-full flex-col overflow-hidden bg-night transition-colors duration-300 hover:bg-[#081530]"
                        >
                            <span className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#0b2f78_0%,#071a45_55%,#050b1a_100%)]">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        loading="lazy"
                                        className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                                    />
                                ) : (
                                    <Pictogram
                                        slug={item.slug}
                                        strokeWidth={1}
                                        className="size-28 text-signal transition-transform duration-500 ease-out-expo group-hover:scale-110"
                                    />
                                )}
                            </span>
                            <span className="flex flex-1 flex-col p-6">
                                <span className="font-display text-base uppercase leading-snug text-white sm:text-lg">
                                    {item.title}
                                </span>
                                {(item.summary || item.rows.length > 0) && (
                                    <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/65">
                                        {item.rows.length > 0
                                            ? item.rows.map((r) => r.title).join(' · ')
                                            : item.summary}
                                    </span>
                                )}
                                <span className="mt-auto flex items-center justify-between pt-6 text-sm font-medium text-signal">
                                    Ver detalle
                                    <span className="flex size-9 items-center justify-center bg-signal text-night transition-colors group-hover:bg-white">
                                        <Arrow />
                                    </span>
                                </span>
                            </span>
                        </a>
                    </Reveal>
                </li>
            ))}
        </ul>
    );
}
