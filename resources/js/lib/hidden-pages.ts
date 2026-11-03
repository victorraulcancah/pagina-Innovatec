import type { HomeContent } from '@/types';

/** false si el enlace lleva a una página cuya opción del menú está oculta, o a algo dentro de ella. */
export function linkIsVisible(home: HomeContent, url: string): boolean {
    const path = url.split(/[?#]/)[0];
    // Soluciones y Servicios viven dentro de la División Enterprise: si ella se oculta, ellas también.
    const page = /^\/(soluciones|servicios)(\/|$)/.test(path)
        ? '/division-enterprise'
        : path;

    return !home.hiddenPages.some(
        (hidden) => page === hidden || page.startsWith(`${hidden}/`),
    );
}
