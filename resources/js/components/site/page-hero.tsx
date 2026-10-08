import type { ReactNode } from 'react';
import { NetworkMesh } from './network-mesh';
import { sectionShell } from './reveal';

/**
 * Cabecera de las páginas interiores: imagen en blanco y negro bajo un velo
 * azul noche (o la malla animada si aún no hay imagen), título
 * y texto. `aside` ocupa el lado derecho en escritorio.
 */
export function PageHero({
    title,
    intro,
    imageUrl,
    aside,
}: {
    title: string;
    intro?: string | null;
    imageUrl?: string | null;
    aside?: ReactNode;
}) {
    return (
        <section className="relative isolate overflow-hidden bg-night pb-16 pt-36 sm:pb-24 sm:pt-44">
            {imageUrl ? (
                <img src={imageUrl} alt="" className="absolute inset-0 -z-20 size-full object-cover grayscale" />
            ) : (
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_90%_at_75%_30%,#0b2f78_0%,#071a45_40%,#050b1a_80%)]" />
            )}
            {!imageUrl && (
                <div className="absolute inset-0 -z-10 opacity-60">
                    <NetworkMesh animate={false} />
                </div>
            )}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,11,26,0.85)_0%,rgba(5,11,26,0.7)_45%,#050b1a_100%)]"
                aria-hidden="true"
            />

            <div className={`${sectionShell} grid items-center gap-12 ${aside ? 'lg:grid-cols-[1fr_minmax(0,420px)]' : ''}`}>
                <div>
                    <h1 className="animate-rise font-display max-w-[20ch] text-[clamp(1.6rem,4.4vw,3.4rem)] leading-[1.12] uppercase text-balance text-white">
                        {title}
                    </h1>
                    {intro && (
                        <p
                            className="animate-rise mt-6 max-w-[58ch] text-base leading-relaxed text-white/75 sm:text-lg"
                            style={{ ['--delay' as string]: '150ms' }}
                        >
                            {intro}
                        </p>
                    )}
                </div>
                {aside}
            </div>
        </section>
    );
}
