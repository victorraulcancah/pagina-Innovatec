import { useEffect, useRef, useState, type ReactNode } from 'react';

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
            className={`transition-[opacity,transform] duration-700 ease-out-expo ${
                state === 'hidden' ? 'translate-y-5 opacity-0' : ''
            } ${className}`}
            style={{ transitionDelay: state === 'shown' ? `${delay}ms` : '0ms' }}
        >
            {children}
        </div>
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
