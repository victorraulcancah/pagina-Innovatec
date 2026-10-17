import type { ReactNode } from 'react';
import type { SiteSections } from '@/types';

const icons: Record<string, { label: string; path: ReactNode }> = {
    facebook: {
        label: 'Facebook',
        path: <path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 5.8 10.5 8v2H8v3.500h2.500V20H14v-6.500h2.500L17 10h-3V8.500c0-.3.200-.500.500-.500z" />,
    },
    linkedin: {
        label: 'LinkedIn',
        path: <path d="M5 9h3v10H5zM6.500 4.500a1.750 1.750 0 110 3.500 1.750 1.750 0 010-3.500zM10.500 9h2.900v1.400c.5-.9 1.600-1.600 3.100-1.600 3 0 3.500 2 3.500 4.500V19h-3v-5c0-1.200 0-2.600-1.600-2.600s-1.900 1.200-1.900 2.500V19h-3z" />,
    },
    instagram: {
        label: 'Instagram',
        path: (
            <>
                <rect x="4.500" y="4.500" width="15" height="15" rx="4.500" />
                <circle cx="12" cy="12" r="3.500" />
                <circle cx="16.800" cy="7.200" r="0.800" />
            </>
        ),
    },
    youtube: {
        label: 'YouTube',
        path: (
            <>
                <rect x="3.500" y="6.500" width="17" height="11" rx="3" />
                <path d="M10.500 9.500v5l4-2.500z" />
            </>
        ),
    },
    tiktok: {
        label: 'TikTok',
        path: <path d="M13 4.500v10.200a2.800 2.800 0 11-2.800-2.800M13 4.500c.4 2.300 1.700 3.600 4 3.800" />,
    },
};

/** Íconos de las redes sociales que tengan enlace en "Datos de la empresa". */
export function SocialLinks({ social, className = '' }: { social: SiteSections['social']; className?: string }) {
    const items = (Object.keys(icons) as (keyof typeof icons)[]).filter((key) => (social as Record<string, string>)[key]);

    if (items.length === 0) {
        return null;
    }

    return (
        <ul className={`flex flex-wrap gap-2 ${className}`}>
            {items.map((key) => (
                <li key={key}>
                    <a
                        href={(social as Record<string, string>)[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={icons[key].label}
                        className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-signal hover:text-signal"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={key === 'facebook' || key === 'linkedin' ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            {icons[key].path}
                        </svg>
                    </a>
                </li>
            ))}
        </ul>
    );
}
