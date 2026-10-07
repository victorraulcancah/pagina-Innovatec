import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';

export type AdminPage = { slug: string; label: string };

/** Marco común del panel: barra superior con las secciones editables. */
export function AdminLayout({
    pages,
    current,
    children,
}: {
    pages: AdminPage[];
    current: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-svh bg-[#f3f5f9] text-slate-900 [color-scheme:light]">
            <header className="bg-night">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
                    <img src="/brand/logo-light.png" alt="PROINNOVATEC" className="h-7 w-auto" />
                    <div className="flex items-center gap-5 text-sm">
                        <a href="/" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                            Ver sitio
                        </a>
                        <button
                            type="button"
                            onClick={() => router.post('/admin/logout')}
                            className="text-white/80 hover:text-white"
                        >
                            Salir
                        </button>
                    </div>
                </div>
                <nav aria-label="Secciones del sitio" className="mx-auto max-w-5xl overflow-x-auto px-6">
                    <ul className="flex gap-1 text-sm">
                        {pages.map((page) => {
                            const active = page.slug === current;

                            return (
                                <li key={page.slug}>
                                    <Link
                                        href={page.slug ? `/admin/${page.slug}` : '/admin'}
                                        aria-current={active ? 'page' : undefined}
                                        className={`block whitespace-nowrap border-b-2 px-3 py-3 transition-colors ${
                                            active
                                                ? 'border-signal text-white'
                                                : 'border-transparent text-white/65 hover:text-white'
                                        }`}
                                    >
                                        {page.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </header>
            {children}
        </div>
    );
}
