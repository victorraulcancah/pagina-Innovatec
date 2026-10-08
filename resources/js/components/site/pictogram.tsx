import type { ReactNode } from 'react';

/**
 * Pictogramas de línea (trazo cian) de cada solución y servicio. Son dibujos
 * propios del sitio: sirven de imagen cuando no se subió una foto.
 */
const paths: Record<string, ReactNode> = {
    'comunicaciones-unificadas': (
        <>
            <path d="M14 34v-6a18 18 0 0136 0v6" />
            <rect x="9" y="33" width="9" height="15" rx="3" />
            <rect x="46" y="33" width="9" height="15" rx="3" />
            <path d="M50 48c0 6-6 9-14 9h-4" />
            <rect x="26" y="52" width="10" height="9" rx="3" />
        </>
    ),
    ciberseguridad: (
        <>
            <path d="M32 6l20 7v16c0 13-8.5 22-20 27C20.500 51 12 42 12 29V13l20-7z" />
            <rect x="24" y="28" width="16" height="12" rx="2.500" />
            <path d="M27 28v-4a5 5 0 0110 0v4M32 33v3" />
        </>
    ),
    networking: (
        <>
            <circle cx="32" cy="14" r="6" />
            <circle cx="12" cy="48" r="6" />
            <circle cx="52" cy="48" r="6" />
            <path d="M28.500 19.500L15 42M35.500 19.500L49 42M18 48h28" />
            <circle cx="32" cy="36" r="2.500" />
        </>
    ),
    'infraestructura-ti': (
        <>
            <rect x="10" y="8" width="44" height="14" rx="2.500" />
            <rect x="10" y="25" width="44" height="14" rx="2.500" />
            <rect x="10" y="42" width="44" height="14" rx="2.500" />
            <path d="M17 15h6M17 32h6M17 49h6M45 15h4M45 32h4M45 49h4" />
        </>
    ),
    'seguridad-electronica': (
        <>
            <path d="M8 22l36-10 4 14-36 10-4-14z" />
            <path d="M38 40l8 14M26 32l-4 22M18 58h24" />
            <circle cx="46" cy="22" r="3" />
        </>
    ),
    consultoria: (
        <>
            <path d="M32 8a16 16 0 00-8 30v6h16v-6a16 16 0 00-8-30z" />
            <path d="M25 50h14M27 56h10M32 22v10l6 4" />
        </>
    ),
    'help-desk': (
        <>
            <circle cx="32" cy="32" r="22" />
            <circle cx="32" cy="32" r="9" />
            <path d="M16 16l10 10M48 16L38 26M16 48l10-10M48 48L38 38" />
        </>
    ),
    'outsourcing-tic': (
        <>
            <path d="M20 44a11 11 0 01-1-22 15 15 0 0128-4 12 12 0 01-1 26H20z" />
            <path d="M26 50l6 6 6-6M32 38v18" />
        </>
    ),
};

const fallback = (
    <>
        <path d="M32 6l22 12.500v27L32 58 10 45.500v-27L32 6z" />
        <path d="M10 18.500L32 31l22-12.500M32 31v27" />
    </>
);

export function Pictogram({
    slug,
    className = '',
    strokeWidth = 1.4,
}: {
    slug?: string | null;
    className?: string;
    strokeWidth?: number;
}) {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={className}
        >
            {(slug && paths[slug]) || fallback}
        </svg>
    );
}
