import type { CSSProperties } from 'react';

type Logo = { name: string; url: string };

function Tile({ logo, hidden = false, ring = false }: { logo: Logo; hidden?: boolean; ring?: boolean }) {
    return (
        <li aria-hidden={hidden || undefined} className="mr-3 shrink-0">
            <div
                className={`flex h-20 w-40 items-center justify-center rounded-md bg-white px-5 shadow-[0_10px_20px_-12px_rgba(5,11,26,0.7)] ${
                    ring ? 'ring-1 ring-night/10' : ''
                }`}
            >
                <img src={logo.url} alt={hidden ? '' : logo.name} loading="lazy" className="max-h-full max-w-full object-contain" />
            </div>
        </li>
    );
}

/**
 * Marquesina de logos (se detiene al pasar el puntero; con "reducir movimiento"
 * es una rejilla). Repite el grupo hasta cubrir una pantalla ancha para que el bucle no deje huecos.
 */
export function LogoMarquee({
    logos,
    reverse = false,
    ring = false,
    style,
}: {
    logos: Logo[];
    reverse?: boolean;
    ring?: boolean;
    style?: CSSProperties;
}) {
    const set = Array.from({ length: Math.max(1, Math.ceil(12 / logos.length)) }, () => logos).flat();

    return (
        <div className={`mq ${reverse ? 'mq-rev' : ''}`} style={style}>
            <ul className="mq-track">
                {set.map((logo, i) => (
                    <Tile key={`${logo.name}-${i}`} logo={logo} ring={ring} hidden={i >= logos.length} />
                ))}
                {set.map((logo, i) => (
                    <Tile key={`${logo.name}-copy-${i}`} logo={logo} ring={ring} hidden />
                ))}
            </ul>
        </div>
    );
}
