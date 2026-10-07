import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { HomeContent, MenuItem } from '@/types';

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

    const linkClass = `relative inline-flex items-center gap-1.5 py-2 text-sm transition-colors ${
        current ? 'text-white' : 'text-white/75 hover:text-white'
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
                    className={linkClass}
                    aria-current={current ? 'page' : undefined}
                >
                    {item.label}
                    {current && (
                        <span className="absolute inset-x-0 -bottom-0.5 h-px bg-white" />
                    )}
                </a>
                {hasChildren && (
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-label={`Abrir ${item.label}`}
                        onClick={() => setOpen((v) => !v)}
                        className="-m-2 p-2 text-white/75 hover:text-white"
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
                                    className="block rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
    const path = url.split(/[?#]/)[0];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
                    <ul className="flex items-center gap-9">
                        {home.menu.map((item, i) => (
                            <DesktopItem
                                key={`${item.label}-${i}`}
                                item={item}
                                current={item.url === path}
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
                        className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-white/70 transition-colors hover:text-white max-sm:hidden"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="5.5" r="2.7" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M2.5 14c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        Panel
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

            {menuOpen && (
                <nav
                    id="mobile-menu"
                    aria-label="Principal móvil"
                    className="fixed inset-x-0 bottom-0 top-[76px] overflow-y-auto bg-night px-6 pb-10 pt-4 lg:hidden"
                >
                    <ul className="divide-y divide-white/10">
                        {home.menu.map((item, i) => (
                            <li key={`${item.label}-${i}`} className="py-4">
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
                                                    className="text-sm text-white/70"
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
                        <a href="/admin" className="text-sm text-white/70 underline underline-offset-4">
                            Panel de administración
                        </a>
                    </div>
                </nav>
            )}
        </header>
    );
}
