import { Fragment, type CSSProperties } from 'react';

/**
 * Titular que sube palabra por palabra desde una máscara. Es el gesto de
 * entrada de la marca: el mismo en la portada y en las cabeceras interiores.
 * El texto queda visible por defecto; solo la animación lo oculta al inicio.
 */
export function KineticTitle({
    text,
    className = '',
    delay = 100,
    stagger = 55,
    as: Tag = 'h1',
}: {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
    as?: 'h1' | 'h2' | 'p';
}) {
    const words = text.split(/\s+/).filter(Boolean);

    return (
        <Tag className={`kinetic-title ${className}`}>
            {words.map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                    {i > 0 && ' '}
                    <span
                        className="k-word"
                        style={
                            {
                                ['--i' as string]: i,
                                ['--d' as string]: `${delay}ms`,
                                ['--st' as string]: `${stagger}ms`,
                            } as CSSProperties
                        }
                    >
                        <span className="k-word-inner">{word}</span>
                    </span>
                </Fragment>
            ))}
        </Tag>
    );
}
