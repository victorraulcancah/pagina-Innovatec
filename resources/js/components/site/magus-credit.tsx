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
