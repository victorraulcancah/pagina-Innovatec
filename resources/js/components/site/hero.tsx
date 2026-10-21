import { useEffect, useRef, useState } from 'react';
import type { HeroButton, HomeContent } from '@/types';
import { KineticTitle } from './kinetic-title';
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
        'btn-sheen bg-signal text-night border-signal hover:bg-white hover:border-white',
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
        <section className="relative isolate flex min-h-[640px] h-svh items-end overflow-hidden bg-deep">
            {/* Medio de fondo: se asienta al cargar y se aleja con el scroll */}
            <div className="hero-media absolute inset-0 -z-10" aria-hidden="true">
                <div className="hero-media-in absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_72%_38%,#1f4fb0_0%,#12307a_38%,#0a1b44_75%)]" />
                    {home.videoUrl ? (
                        <video
                            ref={videoRef}
                            key={home.videoUrl}
                            className="animate-fade absolute inset-0 size-full object-cover"
                            src={home.videoUrl}
                            poster={home.posterUrl ?? undefined}
                            autoPlay={!reducedMotion}
                            muted
                            loop
                            playsInline
                            preload="auto"
                        />
                    ) : (
                        <div className="animate-fade absolute inset-0">
                            <NetworkMesh animate={!reducedMotion} />
                        </div>
                    )}
                </div>
            </div>

            {/* Velo: arriba para el menú, abajo a la izquierda para el texto */}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(10,27,68,0.78)_0%,rgba(10,27,68,0)_24%),linear-gradient(to_top_right,rgba(10,27,68,0.88)_0%,rgba(10,27,68,0.55)_38%,rgba(10,27,68,0)_70%)]"
                aria-hidden="true"
            />

            <div className="hero-copy mx-auto w-full max-w-[1320px] px-6 pb-14 sm:pb-20 lg:px-12 lg:pb-24">
                <KineticTitle
                    as="h1"
                    text={home.title}
                    delay={100}
                    className="font-display max-w-[19ch] text-[clamp(1.3rem,5.4vw,3.4rem)] leading-[1.14] uppercase text-balance text-white"
                />
                <span aria-hidden="true" className="hero-rule mt-6 block h-[3px] w-24 rounded-full bg-signal" />

                {home.subtitle && (
                    <p
                        className="animate-rise mt-6 max-w-[56ch] text-base leading-relaxed text-white sm:text-lg"
                        style={{ ['--delay' as string]: '380ms' }}
                    >
                        {home.subtitle}
                    </p>
                )}

                {home.buttons.length > 0 && (
                    <div
                        className="animate-rise mt-9 flex flex-wrap gap-3"
                        style={{ ['--delay' as string]: '520ms' }}
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

            <div className="hero-cue pointer-events-none absolute bottom-24 right-6 hidden sm:block lg:right-12" aria-hidden="true">
                <span className="hero-cue-line">
                    <span className="hero-cue-dot" />
                </span>
            </div>
        </section>
    );
}
