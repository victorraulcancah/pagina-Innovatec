import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Diálogo modal sobre <dialog>: el navegador ya se encarga del foco atrapado,
 * de Escape y de dejar el resto de la página inerte.
 */
export function Modal({
    open,
    title,
    onClose,
    children,
    footer,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
            document.body.style.overflow = 'hidden';
        } else if (!open && dialog.open) {
            dialog.close();
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open, mounted]);

    // Portal al <body>: así los campos del modal no quedan dentro del <form> de la página.
    if (!mounted) {
        return null;
    }

    return createPortal(
        <dialog
            ref={ref}
            aria-labelledby="modal-title"
            onClose={onClose}
            onClick={(e) => e.target === ref.current && onClose()}
            className="m-auto max-h-[92svh] w-[min(44rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-white p-0 text-slate-900 shadow-[0_30px_80px_-20px_rgba(5,11,26,0.6)] backdrop:bg-night/60 [color-scheme:light]"
        >
            {open && (
                <div className="flex max-h-[92svh] flex-col">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 id="modal-title" className="text-base font-semibold">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="-mr-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-5 overflow-y-auto px-6 py-6">{children}</div>
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">{footer}</div>
                </div>
            )}
        </dialog>,
        document.body,
    );
}
