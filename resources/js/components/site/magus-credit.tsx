import type { CSSProperties } from 'react';

const MAGUS_URL = 'https://magustechnologies.com/';

// El logo se pinta del color de `className` usando el SVG como máscara (el archivo viene en morado oscuro).
const LOGO_MASK: CSSProperties = {
    maskImage: 'url(/brand/magus.svg)',
    WebkitMaskImage: 'url(/brand/magus.svg)',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
};

/** Tarjeta "Desarrollado por" del pie de página, con los colores de Magus (no los del sitio). */
export function MagusCredit() {
    return (
        <a
            href={MAGUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex max-w-full items-center gap-4 self-start rounded-2xl border border-cyan-400/60 bg-[#0a0f1c] px-4 py-3 text-left shadow-[0_0_24px_-8px_rgb(34_211_238/0.5)] transition duration-300 hover:border-cyan-300 hover:shadow-[0_0_28px_-6px_rgb(34_211_238/0.7)] focus-visible:outline-cyan-300 sm:px-5 lg:mr-8 lg:self-auto"
        >
            <span
                aria-hidden="true"
                style={LOGO_MASK}
                className="h-8 w-20 shrink-0 bg-cyan-400 transition group-hover:bg-cyan-300 sm:h-10 sm:w-24"
            />
            <span
                aria-hidden="true"
                className="h-10 w-px shrink-0 bg-white/15"
            />
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">
                    Desarrollado por Magus Technologies
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-cyan-400 group-hover:text-cyan-300">
                    magustechnologies.com
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                        <path
                            d="M5 11l6-6M6 5h5v5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </span>
        </a>
    );
}

/** Crédito discreto del login: en gris claro, toma el color de Magus al pasar el puntero. */
export function MagusLoginCredit() {
    return (
        <div className="mt-10 border-t border-white/15 pt-6 text-center">
            <p className="text-xs text-white/70">Desarrollado por</p>
            <a
                href={MAGUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Magus Technologies"
                className="group mt-1 inline-block rounded-lg"
            >
                <span
                    aria-hidden="true"
                    style={LOGO_MASK}
                    className="block h-12 w-28 bg-white/60 transition duration-300 group-hover:bg-cyan-400 group-focus-visible:bg-cyan-400"
                />
            </a>
        </div>
    );
}
