import { useEffect, useState, type ChangeEvent } from 'react';
import { SmallButton } from '@/components/admin/fields';

export function move<T>(list: T[], from: number, to: number): T[] {
    if (to < 0 || to >= list.length) {
        return list;
    }

    const next = [...list];
    next.splice(to, 0, next.splice(from, 1)[0]);

    return next;
}

/** URL temporal para previsualizar un archivo elegido antes de guardar. */
function useObjectUrl(file: File | null): string | null {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);

            return;
        }

        const next = URL.createObjectURL(file);
        setUrl(next);

        return () => URL.revokeObjectURL(next);
    }, [file]);

    return url;
}

export function MediaPicker({
    label,
    hint,
    accept,
    kind,
    currentUrl,
    file,
    removed,
    error,
    onFile,
    onRemove,
}: {
    label: string;
    hint: string;
    accept: string;
    kind: 'video' | 'image';
    currentUrl: string | null;
    file: File | null;
    removed: boolean;
    error?: string;
    onFile: (file: File | null) => void;
    onRemove: (removed: boolean) => void;
}) {
    const preview = useObjectUrl(file);
    const shown = preview ?? (removed ? null : currentUrl);

    const pick = (e: ChangeEvent<HTMLInputElement>) => {
        onFile(e.target.files?.[0] ?? null);
        onRemove(false);
    };

    return (
        <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 sm:w-56">
                    {shown ? (
                        kind === 'video' ? (
                            <video key={shown} src={shown} muted loop playsInline controls className="size-full object-cover" />
                        ) : (
                            <img src={shown} alt="" className="size-full object-cover" />
                        )
                    ) : (
                        <span className="px-3 text-center text-xs text-slate-400">
                            {removed ? 'Se quitará al guardar' : 'Sin archivo'}
                        </span>
                    )}
                </div>
                <div className="min-w-0 space-y-3">
                    <input
                        type="file"
                        accept={accept}
                        onChange={pick}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-100"
                    />
                    <p className="text-xs text-slate-500">{hint}</p>
                    {(currentUrl || file) && !removed && (
                        <SmallButton
                            danger
                            onClick={() => {
                                onFile(null);
                                onRemove(true);
                            }}
                        >
                            Quitar
                        </SmallButton>
                    )}
                    {removed && (
                        <SmallButton onClick={() => onRemove(false)}>Deshacer</SmallButton>
                    )}
                    {error && (
                        <p role="alert" className="text-xs text-red-700">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

