import { useState, type ReactNode } from 'react';
import { SmallButton } from './fields';
import { move } from './media-picker';
import { Modal } from './modal';

type Summary = { title: string; subtitle?: string; thumb?: string | null };

type Editing<T> = { index: number | null; draft: T };

/**
 * Lista de elementos en filas compactas. Agregar o editar abre un modal con el
 * formulario del elemento; los cambios quedan en la página hasta "Guardar cambios".
 */
export function ItemList<T>({
    items,
    max,
    itemLabel,
    blank,
    onChange,
    summary,
    renderForm,
    errorAt,
    canAccept,
}: {
    items: T[];
    max: number;
    itemLabel: string;
    blank: () => T;
    onChange: (items: T[]) => void;
    summary: (item: T) => Summary;
    renderForm: (draft: T, patch: (p: Partial<T>) => void, index: number | null) => ReactNode;
    errorAt?: (index: number) => boolean;
    canAccept?: (draft: T) => boolean;
}) {
    const [editing, setEditing] = useState<Editing<T> | null>(null);

    const accept = () => {
        if (!editing) {
            return;
        }

        onChange(
            editing.index === null
                ? [...items, editing.draft]
                : items.map((it, k) => (k === editing.index ? editing.draft : it)),
        );
        setEditing(null);
    };

    return (
        <div>
            {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    Todavía no hay elementos.
                </p>
            ) : (
                <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                    {items.map((item, i) => {
                        const s = summary(item);
                        const hasError = errorAt?.(i);

                        return (
                            <li key={i} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-4">
                                {s.thumb !== undefined && (
                                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
                                        {s.thumb && <img src={s.thumb} alt="" className="max-h-full max-w-full object-contain" />}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setEditing({ index: i, draft: structuredClone(item) })}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <span className="block truncate text-sm font-medium text-slate-900">
                                        {s.title || <span className="text-slate-400">Sin título</span>}
                                    </span>
                                    {s.subtitle && <span className="mt-0.5 block truncate text-xs text-slate-500">{s.subtitle}</span>}
                                    {hasError && (
                                        <span role="alert" className="mt-0.5 block text-xs text-red-700">
                                            Revisa este elemento: hay campos con errores.
                                        </span>
                                    )}
                                </button>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <SmallButton aria-label="Subir" disabled={i === 0} onClick={() => onChange(move(items, i, i - 1))}>
                                        ↑
                                    </SmallButton>
                                    <SmallButton aria-label="Bajar" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, i + 1))}>
                                        ↓
                                    </SmallButton>
                                    <SmallButton onClick={() => setEditing({ index: i, draft: structuredClone(item) })}>Editar</SmallButton>
                                    <SmallButton danger onClick={() => onChange(items.filter((_, k) => k !== i))}>
                                        Eliminar
                                    </SmallButton>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {items.length < max && (
                <div className="mt-3">
                    <SmallButton onClick={() => setEditing({ index: null, draft: blank() })}>
                        + Agregar {itemLabel.toLowerCase()}
                    </SmallButton>
                </div>
            )}

            <Modal
                open={editing !== null}
                title={editing?.index === null ? `Agregar ${itemLabel.toLowerCase()}` : `Editar ${itemLabel.toLowerCase()}`}
                onClose={() => setEditing(null)}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="inline-flex min-h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={accept}
                            disabled={editing ? canAccept?.(editing.draft) === false : false}
                            className="inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-40"
                        >
                            {editing?.index === null ? 'Agregar' : 'Aceptar'}
                        </button>
                    </>
                }
            >
                {editing &&
                    renderForm(
                        editing.draft,
                        (p) => setEditing((cur) => (cur ? { ...cur, draft: { ...cur.draft, ...p } } : cur)),
                        editing.index,
                    )}
            </Modal>
        </div>
    );
}
