import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Aparece suave al entrar en pantalla. El contenido es visible por defecto:
 * solo se oculta (en el navegador) lo que aún está por debajo del pliegue.
 */
export function Reveal({
    children,
    className = '',
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<'shown' | 'hidden'>('shown');

    useEffect(() => {
        const el = ref.current;

        if (
            !el ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            el.getBoundingClientRect().top < window.innerHeight * 0.92
        ) {
            return;
        }

        setState('hidden');

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setState('shown');
                    observer.disconnect();
                }
            },
            { threshold: 0.12 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            data-state={state}
            className={`reveal ${className}`}
            style={{ ['--rd' as string]: `${delay}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
}

/**
 * Fase de entrada de un bloque: 'in' por defecto (visible, sin animar) y 'pre'
 * solo si el bloque está bajo el pliegue y el navegador admite movimiento.
 * Al entrar en pantalla pasa a 'in' y el CSS hace la animación.
 */
export function useSeen<T extends HTMLElement>(threshold = 0.18) {
    const ref = useRef<T>(null);
    const [phase, setPhase] = useState<'pre' | 'in'>('in');

    useEffect(() => {
        const el = ref.current;

        if (
            !el ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            el.getBoundingClientRect().top < window.innerHeight * 0.8
        ) {
            return;
        }

        setPhase('pre');

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPhase('in');
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, phase };
}

/** Sección con entrada por fases (clases .ent-* en app.css): los hijos con .ent-rise, .ent-line y .ent-viz se animan al entrar. */
export function Phased({ className = '', children }: { className?: string; children: ReactNode }) {
    const { ref, phase } = useSeen<HTMLElement>(0.12);

    return (
        <section ref={ref} data-phase={phase} className={`ent relative overflow-hidden ${className}`}>
            {children}
        </section>
    );
}

export function SectionHeading({
    title,
    accent,
    className = '',
}: {
    title: string;
    accent?: string;
    className?: string;
}) {
    return (
        <h2
            className={`font-display text-[clamp(1.4rem,3.2vw,2.6rem)] leading-[1.14] uppercase text-balance text-white ${className}`}
        >
            {title}
            {accent && <span className="text-signal"> {accent}</span>}
        </h2>
    );
}

export const sectionShell =
    'mx-auto w-full max-w-[1320px] px-6 lg:px-12';
