/** Glifos de línea que se dibujan al entrar (clase .inc-glyph); uno por tarjeta, rotando. */
export function Glyph({ index, size = 40 }: { index: number; size?: number }) {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 48 48',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
        className: 'inc-glyph',
    };

    switch (index % 4) {
        case 0:
            return (
                <svg {...common}>
                    <path pathLength={1} d="M24 5l16 9v20l-16 9-16-9V14z" />
                    <circle pathLength={1} cx="24" cy="24" r="6" />
                </svg>
            );
        case 1:
            return (
                <svg {...common}>
                    <path pathLength={1} d="M24 6l18 9-18 9-18-9z" />
                    <path pathLength={1} d="M6 24l18 9 18-9M6 33l18 9 18-9" />
                </svg>
            );
        case 2:
            return (
                <svg {...common}>
                    <circle pathLength={1} cx="24" cy="10" r="5" />
                    <circle pathLength={1} cx="9" cy="37" r="5" />
                    <circle pathLength={1} cx="39" cy="37" r="5" />
                    <path pathLength={1} d="M21 14.500L11.500 32.500M27 14.500l9.500 18M14 37h20" />
                </svg>
            );
        default:
            return (
                <svg {...common}>
                    <rect pathLength={1} x="11" y="11" width="26" height="26" rx="4" />
                    <path pathLength={1} d="M18 5v6M30 5v6M18 37v6M30 37v6M5 18h6M5 30h6M37 18h6M37 30h6" />
                    <path pathLength={1} d="M19 24h10M24 19v10" />
                </svg>
            );
    }
}
