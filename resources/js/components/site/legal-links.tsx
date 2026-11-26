import { useEffect, useRef, useState } from 'react';
import type { LegalDoc } from '@/types';

/** Nombre del archivo descargado: «Términos y Condiciones» → «Términos-y-Condiciones.pdf». */
const fileName = (title: string) => `${title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'documento'}.pdf`;

const iconButton = 'grid size-10 shrink-0 place-items-center rounded-full transition-colors';

function Icon({ path }: { path: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
            <path d={path} />
        </svg>
    );
}

/**
 * Ventana de un documento legal: su texto y, si tiene PDF, un ícono para descargarlo y otro para abrirlo.
 * Con solo PDF se muestra el PDF; sin texto ni PDF avisa que estará disponible pronto.
 */
export function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    const hasText = doc.body.trim() !== '';
    const hasPdf = Boolean(doc.fileUrl);
    const [view, setView] = useState<'text' | 'pdf'>(hasText || !hasPdf ? 'text' : 'pdf');

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        dialog.showModal();
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';

            if (dialog.open) {
                dialog.close();
            }
        };
    }, []);

    const tab = (value: 'text' | 'pdf', label: string) => (
        <button
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => setView(value)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${view === value ? 'bg-night text-white' : 'text-slate-600 hover:bg-ice'}`}
        >
            {label}
        </button>
    );

    return (
        <dialog
            ref={ref}
            aria-label={doc.title}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && ref.current?.close()}
            className="m-auto h-[min(48rem,calc(100svh-1.5rem))] w-[min(52rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-white p-0 text-left text-slate-900 shadow-[0_30px_80px_-20px_rgba(5,11,26,0.6)] backdrop:bg-deep/75 backdrop:backdrop-blur-sm [color-scheme:light]"
        >
            <div className="flex h-full flex-col">
                <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 sm:px-6">
                    <h2 className="min-w-0 flex-1 text-base font-semibold sm:text-lg">{doc.title}</h2>
                    {hasPdf && (
                        <>
                            <a href={doc.fileUrl as string} download={fileName(doc.title)} title="Descargar PDF" aria-label="Descargar PDF" className={`${iconButton} bg-signal-deep text-white hover:bg-night`}>
                                <Icon path="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14" />
                            </a>
                            <a href={doc.fileUrl as string} target="_blank" rel="noopener noreferrer" title="Abrir el PDF en otra pestaña" aria-label="Abrir el PDF en otra pestaña" className={`${iconButton} hover:bg-ice`}>
                                <Icon path="M14 5h5v5m0-5-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
                            </a>
                        </>
                    )}
                    <button type="button" onClick={() => ref.current?.close()} aria-label="Cerrar" className={`${iconButton} hover:bg-ice`}>
                        <Icon path="m6 6 12 12M18 6 6 18" />
                    </button>
                </header>

                {hasText && hasPdf && (
                    <div role="tablist" aria-label="Formato del documento" className="flex gap-1 border-b border-slate-200 px-4 py-2 sm:px-6">
                        {tab('text', 'Texto')}
                        {tab('pdf', 'PDF')}
                    </div>
                )}

                {view === 'pdf' && hasPdf ? (
                    <object data={`${doc.fileUrl}#view=FitH`} type="application/pdf" aria-label={doc.title} className="min-h-0 w-full flex-1">
                        <p className="p-6 text-sm">
                            Tu navegador no puede mostrar el PDF aquí.{' '}
                            <a href={doc.fileUrl as string} download={fileName(doc.title)} className="font-semibold text-signal-deep underline">
                                Descárgalo
                            </a>
                            .
                        </p>
                    </object>
                ) : hasText ? (
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 text-[15px] leading-relaxed whitespace-pre-line sm:px-8">{doc.body.trim()}</div>
                ) : (
                    <div className="grid flex-1 place-content-center gap-2 px-6 text-center">
                        <p className="text-lg font-semibold">Este documento estará disponible pronto</p>
                        <p className="text-sm text-slate-600">Si lo necesitas ahora, escríbenos y te lo enviamos.</p>
                    </div>
                )}
            </div>
        </dialog>
    );
}

/** Enlaces del pie a los documentos legales; cada uno abre su ventana. */
export function LegalLinks({ docs, className }: { docs: LegalDoc[]; className: string }) {
    const [open, setOpen] = useState<LegalDoc | null>(null);

    if (docs.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Información legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {docs.map((doc) => (
                    <li key={doc.id}>
                        <button type="button" onClick={() => setOpen(doc)} aria-haspopup="dialog" className={`${className} cursor-pointer text-left`}>
                            {doc.title}
                        </button>
                    </li>
                ))}
            </ul>
            {open && <LegalModal doc={open} onClose={() => setOpen(null)} />}
        </nav>
    );
}
