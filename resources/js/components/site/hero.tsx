import { useEffect, useRef, useState } from 'react';
import type { HeroButton, HomeContent } from '@/types';
import { NetworkMesh } from './network-mesh';

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

const buttonStyles: Record<HeroButton['variant'], string> = {
    primary:
        'bg-signal text-night border-signal hover:bg-white hover:border-white',
    outline:
        'border-white/70 text-white hover:bg-white hover:text-night hover:border-white',
};

export function Hero({ home }: { home: HomeContent }) {
    const reducedMotion = usePrefersReducedMotion();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (reducedMotion) {
            video.pause();
        } else {
            void video.play().catch(() => {});
        }
    }, [reducedMotion, home.videoUrl]);

    return (
        <section className="relative isolate flex min-h-[640px] h-svh items-end overflow-hidden bg-night">
            {/* Medio de fondo */}
            <div
                className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_80%_at_72%_38%,#0b2f78_0%,#071a45_38%,#050b1a_75%)]"
                aria-hidden="true"
            />
            {home.videoUrl ? (
                <video
                    ref={videoRef}
                    key={home.videoUrl}
                    className="animate-fade absolute inset-0 -z-10 size-full object-cover"
                    src={home.videoUrl}
                    poster={home.posterUrl ?? undefined}
                    autoPlay={!reducedMotion}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                />
            ) : (
                <div className="animate-fade absolute inset-0 -z-10">
                    <NetworkMesh animate={!reducedMotion} />
                </div>
            )}

            {/* Velo: arriba para el menú, abajo a la izquierda para el texto */}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,11,26,0.78)_0%,rgba(5,11,26,0)_24%),linear-gradient(to_top_right,rgba(5,11,26,0.88)_0%,rgba(5,11,26,0.55)_38%,rgba(5,11,26,0)_70%)]"
                aria-hidden="true"
            />

            <div className="mx-auto w-full max-w-[1320px] px-6 pb-14 sm:pb-20 lg:px-12 lg:pb-24">
                <h1
                    className="animate-rise font-display max-w-[19ch] text-[clamp(1.3rem,5.4vw,3.4rem)] leading-[1.14] uppercase text-balance text-white"
                    style={{ ['--delay' as string]: '150ms' }}
                >
                    {home.title}
                </h1>

                {home.subtitle && (
                    <p
                        className="animate-rise mt-6 max-w-[56ch] text-base leading-relaxed text-white/75 sm:text-lg"
                        style={{ ['--delay' as string]: '320ms' }}
                    >
                        {home.subtitle}
                    </p>
                )}

                {home.buttons.length > 0 && (
                    <div
                        className="animate-rise mt-9 flex flex-wrap gap-3"
                        style={{ ['--delay' as string]: '480ms' }}
                    >
                        {home.buttons.map((button, i) => (
                            <a
                                key={`${button.label}-${i}`}
                                href={button.url}
                                className={`inline-flex min-h-11 items-center rounded-full border px-6 text-sm font-medium transition-colors duration-200 ${buttonStyles[button.variant]}`}
                            >
                                {button.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
