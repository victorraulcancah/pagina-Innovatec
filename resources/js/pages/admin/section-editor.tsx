import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { Field, Section, SmallButton, TextArea, TextInput } from '@/components/admin/fields';
import { ItemList } from '@/components/admin/item-list';
import { MediaPicker, move } from '@/components/admin/media-picker';
import type { OfferingRow } from '@/types';

type FieldDef = {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'image' | 'pairs' | 'email' | 'gallery';
    max?: number;
    hint?: string;
};

type TextDef = FieldDef & { group: string };

type ListDef = {
    section: string;
    label: string;
    itemLabel: string;
    max: number;
    fields: FieldDef[];
};

type Config = {
    label: string;
    description: string;
    groups: Record<string, string>;
    texts: TextDef[];
    lists: ListDef[];
    images?: { key: string; slot: string; label: string; hint?: string }[];
};

type GalleryItem = { path: string; name: string; url: string };

type ServerItem = {
    id: number;
    title: string;
    body: string;
    url: string;
    rows: OfferingRow[];
    imageUrl: string | null;
    gallery: GalleryItem[];
};

type Item = Omit<ServerItem, 'id'> & {
    id: number | null;
    image: File | null;
    remove_image: boolean;
    gallery_files: File[];
};

type EditorForm = {
    texts: Record<string, Record<string, string>>;
    lists: Record<string, Item[]>;
    images: Record<string, File | null>;
    removed: Record<string, boolean>;
};

type Props = {
    page: string;
    config: Config;
    pages: AdminPage[];
    texts: Record<string, Record<string, string>>;
    lists: Record<string, ServerItem[]>;
    images: Record<string, string | null>;
};

const blankItem = (): Item => ({
    id: null,
    title: '',
    body: '',
    url: '',
    rows: [],
    imageUrl: null,
    gallery: [],
    image: null,
    remove_image: false,
    gallery_files: [],
});

const clean = (items: Item[]): Item[] =>
    items.map((i) => ({ ...i, image: null, remove_image: false, gallery_files: [] }));

export default function SectionEditor({ page, config, pages, texts, lists, images }: Props) {
    const form = useForm<EditorForm>({
        texts,
        lists: Object.fromEntries(Object.entries(lists).map(([section, items]) => [section, clean(items as Item[])])),
        images: Object.fromEntries((config.images ?? []).map((img) => [img.key, null])),
        removed: Object.fromEntries((config.images ?? []).map((img) => [img.key, false])),
    });

    const data = form.data;
    const err = (key: string) => (form.errors as Record<string, string | undefined>)[key];

    const setText = (group: string, key: string, value: string) =>
        form.setData('texts', { ...data.texts, [group]: { ...data.texts[group], [key]: value } });

    const setList = (section: string, items: Item[]) => form.setData('lists', { ...data.lists, [section]: items });

    // Aplana las imágenes de página y deja en cada elemento solo lo que entiende el servidor.
    form.transform((d) => {
        const flat: Record<string, unknown> = {};

        for (const [key, file] of Object.entries(d.images)) {
            if (file) {
                flat[key] = file;
            }

            flat[`remove_${key}`] = d.removed[key] ? 1 : 0;
        }

        return {
            texts: d.texts,
            ...flat,
            lists: Object.fromEntries(
                Object.entries(d.lists).map(([section, items]) => [
                    section,
                    items.map(({ imageUrl: _preview, gallery, gallery_files, image, ...rest }) => ({
                        ...rest,
                        ...(image ? { image } : {}),
                        ...(gallery.length || gallery_files.length
                            ? { gallery_keep: gallery.map((g) => g.path), gallery_files }
                            : {}),
                    })),
                ]),
            ),
        };
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/admin/${page}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () =>
                form.setData((prev) => ({
                    ...prev,
                    images: Object.fromEntries(Object.keys(prev.images).map((k) => [k, null])),
                    removed: Object.fromEntries(Object.keys(prev.removed).map((k) => [k, false])),
                    lists: Object.fromEntries(Object.entries(prev.lists).map(([s, items]) => [s, clean(items)])),
                })),
        });
    };

    const hasErrorAt = (section: string, index: number) =>
        Object.keys(form.errors).some((k) => k.startsWith(`lists.${section}.${index}.`));

    const textGroups = [...new Set(config.texts.map((t) => t.group))];

    const renderFields = (list: ListDef, draft: Item, patch: (p: Partial<Item>) => void, index: number | null) =>
        list.fields.map((f) => {
            const errKey = index === null ? '' : `lists.${list.section}.${index}.${f.key}`;

            if (f.type === 'image') {
                return (
                    <MediaPicker
                        key={f.key}
                        label={f.label}
                        hint="JPG, PNG o WebP, hasta 5 MB."
                        accept="image/jpeg,image/png,image/webp"
                        kind="image"
                        currentUrl={draft.imageUrl}
                        file={draft.image}
                        removed={draft.remove_image}
                        error={err(errKey)}
                        onFile={(file) => patch({ image: file })}
                        onRemove={(v) => patch({ remove_image: v })}
                    />
                );
            }

            if (f.type === 'gallery') {
                return (
                    <GalleryEditor
                        key={f.key}
                        label={f.label}
                        existing={draft.gallery}
                        added={draft.gallery_files}
                        error={err(`${errKey}_files`)}
                        onChange={(gallery, gallery_files) => patch({ gallery, gallery_files })}
                    />
                );
            }

            if (f.type === 'pairs') {
                return (
                    <PairsEditor
                        key={f.key}
                        label={f.label}
                        rows={draft.rows}
                        error={err(errKey)}
                        onChange={(rows) => patch({ rows })}
                    />
                );
            }

            const column = f.key as 'title' | 'body' | 'url';

            return (
                <Field key={f.key} label={f.label} error={err(errKey)}>
                    {f.type === 'textarea' ? (
                        <TextArea rows={4} maxLength={f.max} value={draft[column]} onChange={(e) => patch({ [column]: e.target.value })} />
                    ) : (
                        <TextInput
                            maxLength={f.max}
                            placeholder={f.type === 'url' ? '/pagina o #seccion' : undefined}
                            value={draft[column]}
                            onChange={(e) => patch({ [column]: e.target.value })}
                        />
                    )}
                </Field>
            );
        });

    const summaryOf = (list: ListDef, item: Item) => {
        const hasImage = list.fields.some((f) => f.type === 'image');
        const hasRows = list.fields.some((f) => f.type === 'pairs');
        const brands = item.gallery.length + item.gallery_files.length;
        const text =
            (item.image ? 'Imagen nueva sin guardar. ' : '') +
            (item.body || item.url || (hasRows && item.rows.length ? `${item.rows.length} elementos incluidos` : '')) +
            (brands ? ` · ${brands} marcas` : '');

        return {
            title: item.title,
            subtitle: text.length > 110 ? `${text.slice(0, 110)}…` : text,
            thumb: hasImage ? (item.image || item.remove_image ? null : item.imageUrl) : undefined,
        };
    };

    return (
        <>
            <Head title={config.label} />
            <AdminLayout pages={pages} current={page}>
                <form onSubmit={submit} className="mx-auto max-w-5xl px-6 pb-32 pt-10">
                    <h1 className="text-2xl font-semibold tracking-tight">{config.label}</h1>
                    <p className="mt-2 max-w-prose text-sm text-slate-600">{config.description}</p>

                    <div className="mt-10">
                        {textGroups.map((group) => (
                            <Section key={group} title={config.groups[group] ?? 'Textos'}>
                                {config.texts
                                    .filter((t) => t.group === group)
                                    .map((t) => (
                                        <Field key={t.key} label={t.label} hint={t.hint} error={err(`texts.${group}.${t.key}`)}>
                                            {t.type === 'textarea' ? (
                                                <TextArea
                                                    rows={3}
                                                    maxLength={t.max}
                                                    value={data.texts[group]?.[t.key] ?? ''}
                                                    onChange={(e) => setText(group, t.key, e.target.value)}
                                                />
                                            ) : (
                                                <TextInput
                                                    type={t.type === 'email' ? 'email' : 'text'}
                                                    maxLength={t.max}
                                                    value={data.texts[group]?.[t.key] ?? ''}
                                                    onChange={(e) => setText(group, t.key, e.target.value)}
                                                />
                                            )}
                                        </Field>
                                    ))}
                            </Section>
                        ))}

                        {(config.images ?? []).map((img) => (
                            <Section key={img.key} title={img.label} description={img.hint}>
                                <MediaPicker
                                    label={img.label}
                                    hint="JPG, PNG o WebP, hasta 5 MB."
                                    accept="image/jpeg,image/png,image/webp"
                                    kind="image"
                                    currentUrl={images[img.key] ?? null}
                                    file={data.images[img.key] ?? null}
                                    removed={Boolean(data.removed[img.key])}
                                    error={err(img.key)}
                                    onFile={(f) => form.setData('images', { ...data.images, [img.key]: f })}
                                    onRemove={(v) => form.setData('removed', { ...data.removed, [img.key]: v })}
                                />
                            </Section>
                        ))}

                        {config.lists.map((list) => (
                            <Section
                                key={list.section}
                                title={list.label}
                                description={`Hasta ${list.max}. Usa "Editar" para cambiar un elemento y "Guardar cambios" para publicar.`}
                            >
                                <ItemList<Item>
                                    items={data.lists[list.section] ?? []}
                                    max={list.max}
                                    itemLabel={list.itemLabel}
                                    blank={blankItem}
                                    onChange={(items) => setList(list.section, items)}
                                    summary={(item) => summaryOf(list, item)}
                                    errorAt={(i) => hasErrorAt(list.section, i)}
                                    canAccept={(draft) => draft.title.trim() !== ''}
                                    renderForm={(draft, patch, index) => renderFields(list, draft, patch, index)}
                                />
                                {err(`lists.${list.section}`) && (
                                    <p role="alert" className="text-xs text-red-700">
                                        {err(`lists.${list.section}`)}
                                    </p>
                                )}
                            </Section>
                        ))}
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
                        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
                            <p aria-live="polite" className="text-sm text-slate-600">
                                {form.processing && form.progress
                                    ? `Subiendo… ${form.progress.percentage ?? 0}%`
                                    : form.processing
                                      ? 'Guardando…'
                                      : form.hasErrors
                                        ? 'Revisa los campos marcados en rojo.'
                                        : form.recentlySuccessful
                                          ? 'Cambios guardados.'
                                          : form.isDirty
                                            ? 'Hay cambios sin guardar.'
                                            : ''}
                            </p>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex min-h-11 items-center rounded-full bg-night px-7 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-50"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </>
    );
}

function PairsEditor({
    label,
    rows,
    error,
    onChange,
}: {
    label: string;
    rows: OfferingRow[];
    error?: string;
    onChange: (rows: OfferingRow[]) => void;
}) {
    const patch = (i: number, p: Partial<OfferingRow>) => onChange(rows.map((r, k) => (k === i ? { ...r, ...p } : r)));

    return (
        <div>
            <span className="mb-2 block text-sm font-medium text-slate-800">{label}</span>
            <ul className="space-y-3">
                {rows.map((row, i) => (
                    <li key={i} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_2fr]">
                        <Field label="Nombre">
                            <TextInput maxLength={80} value={row.title} onChange={(e) => patch(i, { title: e.target.value })} />
                        </Field>
                        <Field label="Detalle">
                            <TextInput maxLength={300} value={row.description ?? ''} onChange={(e) => patch(i, { description: e.target.value })} />
                        </Field>
                        <div className="flex gap-2 sm:col-span-2">
                            <SmallButton disabled={i === 0} onClick={() => onChange(move(rows, i, i - 1))}>↑</SmallButton>
                            <SmallButton disabled={i === rows.length - 1} onClick={() => onChange(move(rows, i, i + 1))}>↓</SmallButton>
                            <SmallButton danger onClick={() => onChange(rows.filter((_, k) => k !== i))}>Quitar</SmallButton>
                        </div>
                    </li>
                ))}
            </ul>
            {rows.length < 12 && (
                <div className="mt-3">
                    <SmallButton onClick={() => onChange([...rows, { title: '', description: '' }])}>+ Agregar fila</SmallButton>
                </div>
            )}
            {error && <p role="alert" className="mt-1.5 text-xs text-red-700">{error}</p>}
        </div>
    );
}

/** Logos de marcas: los ya guardados (se pueden quitar) y los nuevos por subir. */
function GalleryEditor({
    label,
    existing,
    added,
    error,
    onChange,
}: {
    label: string;
    existing: GalleryItem[];
    added: File[];
    error?: string;
    onChange: (existing: GalleryItem[], added: File[]) => void;
}) {
    return (
        <div>
            <span className="mb-2 block text-sm font-medium text-slate-800">{label}</span>
            {existing.length + added.length > 0 && (
                <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {existing.map((g) => (
                        <li key={g.path} className="group relative flex aspect-[3/2] items-center justify-center rounded-md bg-white p-2 ring-1 ring-slate-200">
                            <img src={g.url} alt={g.name} className="max-h-full max-w-full object-contain" />
                            <button
                                type="button"
                                aria-label={`Quitar ${g.name}`}
                                onClick={() => onChange(existing.filter((x) => x.path !== g.path), added)}
                                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                    {added.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="relative flex aspect-[3/2] items-center justify-center rounded-md bg-emerald-50 p-2 text-center text-[11px] text-emerald-800 ring-1 ring-emerald-200">
                            <span className="line-clamp-2 break-all">{f.name}</span>
                            <button
                                type="button"
                                aria-label={`Quitar ${f.name}`}
                                onClick={() => onChange(existing, added.filter((_, k) => k !== i))}
                                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                    onChange(existing, [...added, ...Array.from(e.target.files ?? [])]);
                    e.target.value = '';
                }}
                className="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-100"
            />
            <p className="mt-1.5 text-xs text-slate-500">Puedes elegir varios logos a la vez. JPG, PNG o WebP, hasta 3 MB cada uno. Los nuevos se guardan al pulsar "Guardar cambios".</p>
            {error && <p role="alert" className="mt-1.5 text-xs text-red-700">{error}</p>}
        </div>
    );
}
