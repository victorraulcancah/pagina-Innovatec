import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { HomeContent, MenuItem } from '@/types';

/** Un ítem está activo en su propia ruta y en las rutas que cuelgan de ella. */
function isCurrent(item: MenuItem, path: string) {
    return item.url === '/'
        ? path === '/'
        : !item.url.startsWith('#') && (path === item.url || path.startsWith(`${item.url}/`));
}

function Chevron({ open }: { open: boolean }) {
    return (
        <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
            <path
                d="M1 1l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DesktopItem({ item, current }: { item: MenuItem; current: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);
    const hasChildren = item.children.length > 0;

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        const onDown = (e: PointerEvent) =>
            !ref.current?.contains(e.target as Node) && setOpen(false);

        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onDown);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onDown);
        };
    }, [open]);

    const linkClass = `relative inline-flex items-center gap-1.5 whitespace-nowrap py-2 text-[13px] transition-colors xl:text-sm ${
        current ? 'text-white' : 'text-white hover:text-white'
    }`;

    return (
        <li
            ref={ref}
            className="relative"
            onMouseEnter={() => hasChildren && setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <div className="flex items-center gap-1.5">
                <a
                    href={item.url}
                    data-nav-link
                    className={linkClass}
                    aria-current={current ? 'page' : undefined}
                >
                    {item.label}
                </a>
                {hasChildren && (
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-label={`Abrir ${item.label}`}
                        onClick={() => setOpen((v) => !v)}
                        className="-m-2 p-2 text-white hover:text-white"
                    >
                        <Chevron open={open} />
                    </button>
                )}
            </div>

            {hasChildren && open && (
                <div className="animate-rise absolute left-1/2 top-full z-10 w-64 -translate-x-1/2 pt-3 [--delay:0ms]">
                    <ul className="rounded-xl border border-white/15 bg-night/90 p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        {item.children.map((child, i) => (
                            <li key={`${child.label}-${i}`}>
                                <a
                                    href={child.url}
                                    className="block rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    {child.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
}

export function SiteHeader({ home }: { home: HomeContent }) {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const progressRef = useRef<HTMLSpanElement>(null);
    const navRef = useRef<HTMLUListElement>(null);
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
    const path = url.split(/[?#]/)[0];
    const activeIndex = home.menu.findIndex((item) => isCurrent(item, path));

    // Un solo listener: fondo de la barra y avance de lectura.
    useEffect(() => {
        let raf = 0;

        const update = () => {
            raf = 0;
            setScrolled(window.scrollY > 24);

            // Se escribe directo en el DOM: el avance no necesita un render de React.
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            progressRef.current?.style.setProperty('transform', `scaleX(${ratio})`);
        };

        const onScroll = () => {
            if (!raf) {
                raf = requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // El subrayado se dibuja sobre el enlace activo y se recoloca si cambia el ancho.
    useEffect(() => {
        const ul = navRef.current;

        if (!ul) {
            return;
        }

        const measure = () => {
            if (activeIndex < 0) {
                setIndicator(null);
                return;
            }

            const link = ul.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')[activeIndex];

            if (!link) {
                setIndicator(null);
                return;
            }

            const box = ul.getBoundingClientRect();
            const rect = link.getBoundingClientRect();
            setIndicator({ left: rect.left - box.left, width: rect.width });
        };

        measure();
        const raf = requestAnimationFrame(measure);
        window.addEventListener('resize', measure);
        void document.fonts?.ready.then(measure).catch(() => {});

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', measure);
        };
    }, [activeIndex, path, home.menu.length]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const pillClass =
        'inline-flex min-h-10 items-center rounded-full border border-white/80 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-night';

    return (
        <header
            className={`fixed inset-x-0 top-0 z-30 transition-[background-color,backdrop-filter] duration-300 ${
                menuOpen
                    ? 'bg-night'
                    : scrolled
                      ? 'bg-night/80 backdrop-blur-md'
                      : 'bg-transparent'
            }`}
        >
            <div className="mx-auto grid h-[76px] max-w-[1320px] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 lg:px-12">
                <a href="/" className="flex items-center" aria-label={home.brandName}>
                    <img
                        src={home.logoUrl}
                        alt={home.brandName}
                        className="h-8 w-auto sm:h-9"
                    />
                </a>

                <nav aria-label="Principal" className="hidden justify-center lg:flex">
                    <ul ref={navRef} className="relative flex items-center gap-4 xl:gap-9">
                        {indicator && (
                            <span
                                aria-hidden="true"
                                className="nav-indicator"
                                style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
                            />
                        )}
                        {home.menu.map((item, i) => (
                            <DesktopItem
                                key={`${item.label}-${i}`}
                                item={item}
                                current={isCurrent(item, path)}
                            />
                        ))}
                    </ul>
                </nav>

                <div className="flex items-center justify-end gap-3 max-lg:col-start-3">
                    {home.navCta && (
                        <a href={home.navCta.url} className={`${pillClass} max-sm:hidden`}>
                            {home.navCta.label}
                        </a>
                    )}
                    <a
                        href="/admin"
                        className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-white transition-colors hover:text-white max-sm:hidden"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="5.5" r="2.7" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M2.5 14c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        <span className="lg:max-xl:sr-only">Panel</span>
                    </a>
                    <button
                        type="button"
                        className="-mr-2 p-2 text-white lg:hidden"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                            {menuOpen ? (
                                <path d="M5 5l16 16M21 5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            ) : (
                                <path d="M4 8h18M4 13h18M4 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            <span
                ref={progressRef}
                aria-hidden="true"
                className="scroll-progress"
                style={{ transform: 'scaleX(0)' }}
            />

            {menuOpen && (
                <nav
                    id="mobile-menu"
                    aria-label="Principal móvil"
                    className="menu-panel fixed inset-x-0 bottom-0 top-[76px] overflow-y-auto bg-night px-6 pb-10 pt-4 lg:hidden"
                >
                    <ul className="divide-y divide-white/10">
                        {home.menu.map((item, i) => (
                            <li
                                key={`${item.label}-${i}`}
                                className="menu-item py-4"
                                style={{ ['--i' as string]: i } as CSSProperties}
                            >
                                <a
                                    href={item.url}
                                    onClick={() => setMenuOpen(false)}
                                    className="font-display text-lg uppercase text-white"
                                >
                                    {item.label}
                                </a>
                                {item.children.length > 0 && (
                                    <ul className="mt-3 space-y-2.5 pl-1">
                                        {item.children.map((child, j) => (
                                            <li key={`${child.label}-${j}`}>
                                                <a
                                                    href={child.url}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="text-sm text-white"
                                                >
                                                    {child.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        {home.navCta && (
                            <a
                                href={home.navCta.url}
                                onClick={() => setMenuOpen(false)}
                                className={pillClass}
                            >
                                {home.navCta.label}
                            </a>
                        )}
                        <a href="/admin" className="text-sm text-white underline underline-offset-4">
                            Panel de administración
                        </a>
                    </div>
                </nav>
            )}
        </header>
    );
}
