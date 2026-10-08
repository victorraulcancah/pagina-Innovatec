import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';

export type AdminPage = { slug: string; label: string };

const icons: Record<string, ReactNode> = {
    '': <path d="M3 10.5L10 4l7 6.5V16a1 1 0 01-1 1h-3.5v-4.5h-5V17H4a1 1 0 01-1-1v-5.5z" />,
    nosotros: (
        <>
            <circle cx="7.5" cy="7" r="2.5" />
            <path d="M2.5 16c.4-2.4 2.3-3.8 5-3.8s4.6 1.4 5 3.8" />
            <circle cx="14" cy="8" r="2" />
            <path d="M14.5 12.4c1.6.2 2.7 1.3 3 3.1" />
        </>
    ),
    soluciones: (
        <>
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <rect x="11" y="3" width="6" height="6" rx="1" />
            <rect x="3" y="11" width="6" height="6" rx="1" />
            <rect x="11" y="11" width="6" height="6" rx="1" />
        </>
    ),
    experiencia: (
        <>
            <circle cx="10" cy="8" r="4.5" />
            <path d="M7.5 12l-1 5 3.5-2 3.5 2-1-5" />
        </>
    ),
    clientes: (
        <>
            <path d="M4 17V6.5L10 3l6 3.5V17" />
            <path d="M8 17v-4h4v4M7.5 8.5h1M11.5 8.5h1" />
        </>
    ),
    contacto: (
        <>
            <rect x="3" y="5" width="14" height="10" rx="1.5" />
            <path d="M3.5 6l6.5 5 6.5-5" />
        </>
    ),
};

function NavIcon({ slug }: { slug: string }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[slug] ?? icons['']}
        </svg>
    );
}

/** Marco del panel: menú lateral con las secciones editables. */
export function AdminLayout({
    pages,
    current,
    children,
}: {
    pages: AdminPage[];
    current: string;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;
    const email = auth?.user?.email;

    useEffect(() => setOpen(false), [current]);

    return (
        <div className="min-h-svh bg-[#f3f5f9] text-slate-900 [color-scheme:light]">
            {/* Barra superior en móvil */}
            <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-night px-4 lg:hidden">
                <img src="/brand/logo-light.png" alt="PROINNOVATEC" className="h-6 w-auto" />
                <button
                    type="button"
                    aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={open}
                    aria-controls="admin-sidebar"
                    onClick={() => setOpen((v) => !v)}
                    className="-mr-2 p-2 text-white"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        {open ? (
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        ) : (
                            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        )}
                    </svg>
                </button>
            </div>

            {open && (
                <button
                    type="button"
                    aria-label="Cerrar menú"
                    className="fixed inset-0 z-30 bg-night/60 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                id="admin-sidebar"
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-night text-white transition-transform duration-300 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center border-b border-white/10 px-6 max-lg:hidden">
                    <img src="/brand/logo-light.png" alt="PROINNOVATEC" className="h-7 w-auto" />
                </div>

                <p className="px-6 pb-2 pt-6 text-xs font-medium text-white/45 max-lg:pt-20">Contenido del sitio</p>

                <nav aria-label="Secciones del sitio" className="flex-1 overflow-y-auto px-3">
                    <ul className="space-y-1">
                        {pages.map((page) => {
                            const active = page.slug === current;

                            return (
                                <li key={page.slug}>
                                    <Link
                                        href={page.slug ? `/admin/${page.slug}` : '/admin'}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                                            active
                                                ? 'bg-white/10 font-medium text-white'
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className={active ? 'text-signal' : 'text-white/50'}>
                                            <NavIcon slug={page.slug} />
                                        </span>
                                        {page.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t border-white/10 p-3">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3M11 3h6v6M17 3l-8 8" />
                        </svg>
                        Ver sitio
                    </a>
                    <button
                        type="button"
                        onClick={() => router.post('/admin/logout')}
                        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M12 6l4 4-4 4M16 10H8" />
                        </svg>
                        Salir
                    </button>
                    {email && <p className="mt-2 truncate px-3 text-xs text-white/40">{email}</p>}
                </div>
            </aside>

            <div className="lg:pl-64">{children}</div>
        </div>
    );
}
