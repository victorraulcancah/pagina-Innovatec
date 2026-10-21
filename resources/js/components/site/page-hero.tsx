import type { ReactNode } from 'react';
import { KineticTitle } from './kinetic-title';
import { NetworkMesh } from './network-mesh';
import { sectionShell } from './reveal';

/**
 * Cabecera de las páginas interiores: imagen en blanco y negro bajo un velo
 * azul noche (o la malla animada si aún no hay imagen), título
 * y texto. `aside` ocupa el lado derecho en escritorio.
 */
export function PageHero({
    title,
    subtitle,
    intro,
    imageUrl,
    aside,
    actions,
}: {
    title: string;
    subtitle?: string | null;
    intro?: string | null;
    imageUrl?: string | null;
    aside?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <section className="relative isolate overflow-hidden bg-night pb-16 pt-36 sm:pb-24 sm:pt-44">
            {imageUrl ? (
                <img src={imageUrl} alt="" className="absolute inset-0 -z-20 size-full object-cover grayscale" />
            ) : (
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_90%_at_75%_30%,#1f4fb0_0%,#17358a_40%,#11285c_80%)]" />
            )}
            {!imageUrl && (
                <div className="absolute inset-0 -z-10 opacity-60">
                    <NetworkMesh animate={false} />
                </div>
            )}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(17,40,92,0.85)_0%,rgba(17,40,92,0.7)_45%,#11285c_100%)]"
                aria-hidden="true"
            />

            <div className={`${sectionShell} grid items-center gap-12 ${aside ? 'lg:grid-cols-[1fr_minmax(0,420px)]' : ''}`}>
                <div>
                    <KineticTitle
                        as="h1"
                        text={title}
                        delay={100}
                        className="font-display max-w-[20ch] text-[clamp(1.6rem,4.4vw,3.4rem)] leading-[1.12] uppercase text-balance text-white"
                    />
                    {subtitle && (
                        <p
                            className="animate-rise mt-5 max-w-[34ch] text-xl leading-snug text-white sm:text-2xl"
                            style={{ ['--delay' as string]: '100ms' }}
                        >
                            {subtitle}
                        </p>
                    )}
                    {intro && (
                        <p
                            className="animate-rise mt-6 max-w-[58ch] text-base leading-relaxed text-white sm:text-lg"
                            style={{ ['--delay' as string]: '150ms' }}
                        >
                            {intro}
                        </p>
                    )}
                    {actions && <div className="animate-rise mt-9" style={{ ['--delay' as string]: '250ms' }}>{actions}</div>}
                </div>
                {aside}
            </div>
        </section>
    );
}
