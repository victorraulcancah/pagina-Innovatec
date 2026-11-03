import type { CSSProperties } from 'react';
import type { SiteSections } from '@/types';
import { Phased, SectionHeading, sectionShell } from './reveal';

type Allies = SiteSections['allies'];

/**
 * Herramientas y certificaciones: cada una con su insignia, su nombre y, si se escribió, una descripción.
 * `compact` deja solo insignia y nombre (para la portada).
 */
export function AllyGrid({
    items,
    compact = false,
}: {
    items: Allies['items'];
    compact?: boolean;
}) {
    return (
        <ul
            className={`grid gap-4 ${compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}
        >
            {items.map((ally, i) => (
                <li
                    key={ally.id}
                    className="ent-pop"
                    style={
                        {
                            ['--d' as string]: `${150 + (i % 8) * 80}ms`,
                        } as CSSProperties
                    }
                >
                    <article
                        className={`inc-card group relative flex h-full items-center gap-4 overflow-hidden rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/15 hover:bg-white/[0.11] sm:gap-5 ${
                            compact ? '' : 'sm:p-5'
                        }`}
                    >
                        <span
                            className={`flex shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-[0_10px_20px_-12px_rgba(5,11,26,0.8)] ring-1 ring-night/10 transition-transform duration-500 ease-out-expo group-hover:scale-105 group-hover:-rotate-2 ${
                                compact ? 'size-16' : 'size-24'
                            }`}
                        >
                            {ally.imageUrl ? (
                                <img
                                    src={ally.imageUrl}
                                    alt=""
                                    loading="lazy"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <span className="text-center text-[10px] leading-tight font-semibold text-night">
                                    {ally.name}
                                </span>
                            )}
                        </span>
                        <div className="min-w-0">
                            <h3
                                className={`leading-snug font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}
                            >
                                {ally.name}
                            </h3>
                            {!compact && ally.description && (
                                <p className="mt-1.5 text-sm leading-relaxed text-white">
                                    {ally.description}
                                </p>
                            )}
                        </div>
                        <span
                            aria-hidden="true"
                            className="inc-bar absolute inset-x-0 bottom-0 h-[3px] bg-signal"
                        />
                    </article>
                </li>
            ))}
        </ul>
    );
}

/** Versión de portada: título, texto y todas las herramientas y certificaciones. */
export function AlliesTeaser({ allies }: { allies: Allies }) {
    if (allies.items.length === 0) {
        return null;
    }

    return (
        <Phased className="bg-night-2 py-24 lg:py-32">
            <div
                aria-hidden="true"
                className="ent-glow absolute -right-32 bottom-0 size-[28rem] rounded-full bg-signal-deep/45 blur-3xl"
            />
            <div className={`${sectionShell} relative`}>
                <div className="ent-rise mx-auto max-w-[62ch] text-center">
                    <SectionHeading title={allies.title} />
                    {allies.intro && (
                        <p className="mt-6 text-base leading-relaxed text-white sm:text-lg">
                            {allies.intro}
                        </p>
                    )}
                </div>
                <div className="mt-14">
                    <AllyGrid items={allies.items} compact />
                </div>
            </div>
        </Phased>
    );
}
