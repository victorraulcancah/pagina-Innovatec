import type { PointerEvent } from 'react';

/**
 * Deja la posición del puntero en `--mx` / `--my` para que el resplandor de
 * las tarjetas (CSS) siga al cursor. Solo con ratón: en táctil no hay hover.
 */
export function trackPointer(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse') {
        return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    e.currentTarget.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(1)}px`);
    e.currentTarget.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(1)}px`);
}
