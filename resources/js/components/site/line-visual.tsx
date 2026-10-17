import type { CSSProperties, ReactNode } from 'react';

const i = (n: number) => ({ ['--i' as string]: n }) as CSSProperties;
const path = (d: string): CSSProperties => ({ offsetPath: `path('${d}')` });

/**
 * Ilustraciones propias (trazo cian sobre azul) de cada línea de solución.
 * Se usan como imagen cuando no se subió una foto desde el panel; las
 * animaciones son CSS y se detienen con «reducir movimiento».
 */
const scenes: Record<string, ReactNode> = {
    'comunicaciones-unificadas': (
        <>
            <rect x="110" y="62" width="260" height="164" rx="10" fill="rgba(6,194,240,0.08)" stroke="#06c2f0" strokeWidth="1.6" />
            <circle cx="240" cy="130" r="26" stroke="#fff" strokeWidth="1.6" fill="none" />
            <path d="M200 206c4-22 20-32 40-32s36 10 40 32" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <circle className="viz-pulse" cx="240" cy="130" r="26" stroke="#06c2f0" strokeWidth="1.2" fill="none" />
            <g className="viz-float" style={i(0)}>
                <rect x="48" y="40" width="82" height="50" rx="8" fill="#11285c" stroke="#06c2f0" strokeWidth="1.4" />
                <circle cx="76" cy="62" r="9" stroke="#fff" strokeWidth="1.3" fill="none" />
                <path d="M96 58h22M96 68h14" stroke="#06c2f0" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            <g className="viz-float" style={i(2)}>
                <rect x="352" y="196" width="86" height="52" rx="8" fill="#11285c" stroke="#06c2f0" strokeWidth="1.4" />
                <path d="M370 214h44M370 226h30M370 238h38" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            </g>
            <g>
                {Array.from({ length: 13 }).map((_, k) => (
                    <rect key={k} className="viz-bar" style={i(k)} x={150 + k * 14} y="262" width="6" height="56" rx="3" fill="#06c2f0" />
                ))}
            </g>
        </>
    ),
    ciberseguridad: (
        <>
            <g className="viz-spin" style={{ transformOrigin: '240px 180px', transformBox: 'view-box' }}>
                <circle cx="240" cy="180" r="140" stroke="rgba(6,194,240,0.35)" strokeWidth="1" strokeDasharray="3 9" fill="none" />
                <circle cx="380" cy="180" r="7" fill="#06c2f0" />
                <circle cx="170" cy="301" r="5" fill="#fff" />
            </g>
            <circle className="viz-pulse" cx="240" cy="180" r="90" stroke="#06c2f0" strokeWidth="1.2" fill="none" />
            <defs>
                <clipPath id="viz-shield">
                    <path d="M240 78l78 27v62c0 52-33 86-78 108-45-22-78-56-78-108v-62z" />
                </clipPath>
            </defs>
            <path d="M240 78l78 27v62c0 52-33 86-78 108-45-22-78-56-78-108v-62z" fill="rgba(6,194,240,0.1)" stroke="#06c2f0" strokeWidth="2" strokeLinejoin="round" />
            <g clipPath="url(#viz-shield)">
                <rect className="viz-scan" x="150" y="150" width="180" height="26" fill="url(#viz-scanfade)" />
                <defs>
                    <linearGradient id="viz-scanfade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#06c2f0" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#06c2f0" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#06c2f0" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </g>
            <rect x="214" y="166" width="52" height="40" rx="6" stroke="#fff" strokeWidth="2" fill="#11285c" />
            <path d="M224 166v-12a16 16 0 0132 0v12" stroke="#fff" strokeWidth="2" fill="none" />
            <circle cx="240" cy="184" r="4" fill="#06c2f0" />
        </>
    ),
    networking: (
        <>
            {[
                ['M240 180 L90 80', 90, 80],
                ['M240 180 L390 80', 390, 80],
                ['M240 180 L60 220', 60, 220],
                ['M240 180 L420 230', 420, 230],
                ['M240 180 L150 300', 150, 300],
                ['M240 180 L330 304', 330, 304],
            ].map(([d, x, y], k) => (
                <g key={k}>
                    <path d={d as string} stroke="rgba(6,194,240,0.5)" strokeWidth="1.3" />
                    <circle cx={x as number} cy={y as number} r="13" fill="#11285c" stroke="#06c2f0" strokeWidth="1.6" />
                    <circle cx={x as number} cy={y as number} r="4" fill="#fff" />
                    <circle className="viz-packet" style={{ ...path(d as string), ...i(k) }} r="4" fill="#06c2f0" />
                </g>
            ))}
            <circle className="viz-pulse" cx="240" cy="180" r="32" stroke="#06c2f0" strokeWidth="1.2" fill="none" />
            <rect x="214" y="160" width="52" height="40" rx="7" fill="#11285c" stroke="#fff" strokeWidth="1.8" />
            <path d="M224 174h32M224 186h32" stroke="#06c2f0" strokeWidth="2" strokeLinecap="round" />
        </>
    ),
    'infraestructura-ti': (
        <>
            {[0, 1, 2].map((r) => (
                <g key={r} transform={`translate(${96 + r * 104} 58)`}>
                    <rect width="88" height="240" rx="6" fill="rgba(6,194,240,0.07)" stroke="#06c2f0" strokeWidth="1.5" />
                    {Array.from({ length: 6 }).map((_, u) => (
                        <g key={u} transform={`translate(8 ${12 + u * 37})`}>
                            <rect width="72" height="28" rx="4" fill="#11285c" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                            <rect x="8" y="12" width="28" height="4" rx="2" fill="rgba(6,194,240,0.45)" />
                            <circle className="viz-blink" style={i(r * 7 + u)} cx="58" cy="9" r="3" fill="#06c2f0" />
                            <circle className="viz-blink" style={i(r * 5 + u + 3)} cx="58" cy="19" r="3" fill="#fff" />
                        </g>
                    ))}
                </g>
            ))}
            <path className="viz-flow" d="M48 180h30M402 180h30" stroke="#06c2f0" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 8" />
        </>
    ),
    'seguridad-electronica': (
        <>
            <path d="M40 318h400" stroke="rgba(6,194,240,0.4)" strokeWidth="1.2" />
            <g className="viz-sweep" style={{ transformOrigin: '372px 84px', transformBox: 'view-box' }}>
                <path d="M372 84L250 318h244z" fill="url(#viz-cone)" />
            </g>
            <defs>
                <linearGradient id="viz-cone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#06c2f0" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#06c2f0" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect x="350" y="56" width="52" height="16" rx="4" fill="#11285c" stroke="#fff" strokeWidth="1.6" />
            <path d="M350 64h-34l-6 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <circle cx="372" cy="84" r="12" fill="#11285c" stroke="#06c2f0" strokeWidth="2" />
            <circle cx="372" cy="84" r="4" fill="#06c2f0" />
            <g className="viz-float" style={i(1)}>
                <circle cx="190" cy="236" r="16" stroke="#fff" strokeWidth="1.7" fill="none" />
                <path d="M158 318c2-28 14-40 32-40s30 12 32 40" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            </g>
            <g stroke="#06c2f0" strokeWidth="2" fill="none" strokeLinecap="round">
                <path d="M60 60v-20h20M420 300v20h-20M60 300v20h20" />
            </g>
            <circle className="viz-blink" cx="92" cy="52" r="5" fill="#ff5a5a" />
            <path d="M104 52h28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
    ),
};

const fallback = (
    <>
        {[0, 1, 2].map((k) => (
            <circle key={k} className="viz-pulse" style={i(k)} cx="240" cy="180" r="80" stroke="#06c2f0" strokeWidth="1.2" fill="none" />
        ))}
        {[
            [240, 180],
            [140, 110],
            [350, 120],
            [150, 260],
            [340, 256],
        ].map(([x, y], k) => (
            <g key={k}>
                {k > 0 && <path d={`M240 180L${x} ${y}`} stroke="rgba(6,194,240,0.5)" strokeWidth="1.3" />}
                <circle cx={x} cy={y} r={k === 0 ? 16 : 10} fill="#11285c" stroke="#06c2f0" strokeWidth="1.6" />
                <circle cx={x} cy={y} r="3.5" fill="#fff" />
            </g>
        ))}
    </>
);

/** Foto de la línea si existe; si no, su ilustración animada. Ocupa todo el contenedor padre. */
export function LineVisual({
    slug,
    imageUrl,
    className = '',
}: {
    slug: string | null;
    imageUrl: string | null;
    className?: string;
}) {
    return (
        <div
            className={`viz relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#1f4fb0_0%,#17358a_45%,#11285c_100%)] ${className}`}
        >
            {imageUrl ? (
                <img src={imageUrl} alt="" loading="lazy" className="viz-photo size-full object-cover" />
            ) : (
                <svg viewBox="0 0 480 360" aria-hidden="true" className="size-full" preserveAspectRatio="xMidYMid slice">
                    <g fill="none">{(slug && scenes[slug]) || fallback}</g>
                </svg>
            )}
            {/* Esquinas tipo HUD */}
            <span aria-hidden="true" className="viz-corner left-3 top-3 border-l-2 border-t-2" />
            <span aria-hidden="true" className="viz-corner right-3 top-3 border-r-2 border-t-2" />
            <span aria-hidden="true" className="viz-corner bottom-3 left-3 border-b-2 border-l-2" />
            <span aria-hidden="true" className="viz-corner bottom-3 right-3 border-b-2 border-r-2" />
        </div>
    );
}
