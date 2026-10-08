import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { ItemList } from '@/components/admin/item-list';
import { MediaPicker, move } from '@/components/admin/media-picker';
import {
    Field,
    Section,
    Select,
    SmallButton,
    TextArea,
    TextInput,
} from '@/components/admin/fields';
import type { HeroButton, HomeContent, MenuChild, MenuItem } from '@/types';

type EditorData = {
    brand_name: string;
    title: string;
    subtitle: string;
    buttons: HeroButton[];
    menu: MenuItem[];
    nav_cta: MenuChild;
    logo: File | null;
    remove_logo: boolean;
    video: File | null;
    remove_video: boolean;
    poster: File | null;
    remove_poster: boolean;
};

const MAX_VIDEO_MB = 100;

export default function HomeEditor({
    home,
    pages,
}: {
    home: HomeContent;
    pages: AdminPage[];
}) {
    const form = useForm<EditorData>({
        brand_name: home.brandName,
        title: home.title,
        subtitle: home.subtitle ?? '',
        buttons: home.buttons,
        menu: home.menu,
        nav_cta: home.navCta ?? { label: '', url: '' },
        logo: null,
        remove_logo: false,
        video: null,
        remove_video: false,
        poster: null,
        remove_poster: false,
    });
    const { data, setData, errors } = form;

    const err = (key: string) => (errors as Record<string, string | undefined>)[key];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/inicio', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData((prev) => ({
                    ...prev,
                    logo: null,
                    video: null,
                    poster: null,
                    remove_logo: false,
                    remove_video: false,
                    remove_poster: false,
                }));
            },
        });
    };

    const setButton = (i: number, patch: Partial<HeroButton>) =>
        setData('buttons', data.buttons.map((b, k) => (k === i ? { ...b, ...patch } : b)));

    const setMenuItem = (i: number, patch: Partial<MenuItem>) =>
        setData('menu', data.menu.map((m, k) => (k === i ? { ...m, ...patch } : m)));

    const setChild = (i: number, j: number, patch: Partial<MenuChild>) =>
        setMenuItem(i, {
            children: data.menu[i].children.map((c, k) => (k === j ? { ...c, ...patch } : c)),
        });

    const hasErrorAt = (group: string, index: number) =>
        Object.keys(errors).some((k) => k.startsWith(`${group}.${index}.`));

    const videoTooBig = data.video && data.video.size > MAX_VIDEO_MB * 1024 * 1024;

    return (
        <>
            <Head title="Editar inicio" />
            <AdminLayout pages={pages} current="">
                <form onSubmit={submit} className="mx-auto max-w-5xl px-6 pb-32 pt-10">
                    <h1 className="text-2xl font-semibold tracking-tight">Página de inicio</h1>
                    <p className="mt-2 max-w-prose text-sm text-slate-600">
                        Todo lo que se ve en la portada del sitio se edita aquí. Los cambios se publican al guardar.
                    </p>

                    <div className="mt-10">
                        <Section
                            title="Fondo de la portada"
                            description="El video se repite en bucle, sin sonido. Sin video se muestra una animación de red."
                        >
                            <MediaPicker
                                label="Video de fondo"
                                hint={`MP4 o WebM, hasta ${MAX_VIDEO_MB} MB. Conviene que pese poco (de 5 a 15 MB) y dure entre 10 y 30 segundos.`}
                                accept="video/mp4,video/webm"
                                kind="video"
                                currentUrl={home.videoUrl}
                                file={data.video}
                                removed={data.remove_video}
                                error={err('video') ?? (videoTooBig ? `Supera los ${MAX_VIDEO_MB} MB.` : undefined)}
                                onFile={(f) => setData('video', f)}
                                onRemove={(v) => setData('remove_video', v)}
                            />
                            <MediaPicker
                                label="Imagen de carga (opcional)"
                                hint="Se ve mientras el video carga y si el visitante prefiere menos movimiento. JPG, PNG o WebP, hasta 5 MB."
                                accept="image/jpeg,image/png,image/webp"
                                kind="image"
                                currentUrl={home.posterUrl}
                                file={data.poster}
                                removed={data.remove_poster}
                                error={err('poster')}
                                onFile={(f) => setData('poster', f)}
                                onRemove={(v) => setData('remove_poster', v)}
                            />
                        </Section>

                        <Section title="Texto principal" description="Se muestra sobre el video, abajo a la izquierda.">
                            <Field label="Título" error={errors.title} hint="Se escribe en mayúsculas automáticamente.">
                                <TextInput
                                    value={data.title}
                                    maxLength={120}
                                    invalid={!!errors.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                            </Field>
                            <Field label="Subtítulo" error={errors.subtitle}>
                                <TextArea
                                    rows={3}
                                    maxLength={300}
                                    value={data.subtitle}
                                    invalid={!!errors.subtitle}
                                    onChange={(e) => setData('subtitle', e.target.value)}
                                />
                            </Field>
                        </Section>

                        <Section title="Botones" description="Hasta 3 botones debajo del texto. El de relleno es el principal.">
                            <ItemList<HeroButton>
                                items={data.buttons}
                                max={3}
                                itemLabel="Botón"
                                blank={() => ({ label: '', url: '', variant: 'outline' })}
                                onChange={(items) => setData('buttons', items)}
                                summary={(b) => ({
                                    title: b.label,
                                    subtitle: `${b.url || 'Sin enlace'} · ${b.variant === 'primary' ? 'Relleno' : 'Contorno'}`,
                                })}
                                errorAt={(i) => hasErrorAt('buttons', i)}
                                canAccept={(d) => d.label.trim() !== '' && d.url.trim() !== ''}
                                renderForm={(d, patch, i) => (
                                    <>
                                        <Field label="Texto" error={i === null ? undefined : err(`buttons.${i}.label`)}>
                                            <TextInput value={d.label} maxLength={40} onChange={(e) => patch({ label: e.target.value })} />
                                        </Field>
                                        <Field label="Enlace" hint="Una ruta (/contacto), una sección (#contacto) o un enlace completo." error={i === null ? undefined : err(`buttons.${i}.url`)}>
                                            <TextInput value={d.url} placeholder="/contacto o #seccion" onChange={(e) => patch({ url: e.target.value })} />
                                        </Field>
                                        <Field label="Estilo">
                                            <Select value={d.variant} onChange={(e) => patch({ variant: e.target.value as HeroButton['variant'] })}>
                                                <option value="primary">Relleno</option>
                                                <option value="outline">Contorno</option>
                                            </Select>
                                        </Field>
                                    </>
                                )}
                            />
                        </Section>

                        <Section title="Menú de navegación" description="Cada opción puede tener un submenú desplegable.">
                            <ItemList<MenuItem>
                                items={data.menu}
                                max={8}
                                itemLabel="Opción"
                                blank={() => ({ label: '', url: '', children: [] })}
                                onChange={(items) => setData('menu', items)}
                                summary={(m) => ({
                                    title: m.label,
                                    subtitle: `${m.url || 'Sin enlace'}${m.children.length ? ` · ${m.children.length} en el submenú` : ''}`,
                                })}
                                errorAt={(i) => hasErrorAt('menu', i)}
                                canAccept={(d) => d.label.trim() !== '' && d.url.trim() !== ''}
                                renderForm={(d, patch, i) => (
                                    <>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="Texto" error={i === null ? undefined : err(`menu.${i}.label`)}>
                                                <TextInput value={d.label} maxLength={40} onChange={(e) => patch({ label: e.target.value })} />
                                            </Field>
                                            <Field label="Enlace" error={i === null ? undefined : err(`menu.${i}.url`)}>
                                                <TextInput value={d.url} placeholder="/nosotros o #seccion" onChange={(e) => patch({ url: e.target.value })} />
                                            </Field>
                                        </div>
                                        <SubmenuEditor items={d.children} onChange={(children) => patch({ children })} />
                                    </>
                                )}
                            />
                        </Section>

                        <Section title="Marca y botón del menú" description="Logo y botón con contorno que aparece arriba a la derecha.">
                            <Field label="Nombre de la marca" error={errors.brand_name} hint="Se usa como texto alternativo del logo y título de la pestaña.">
                                <TextInput value={data.brand_name} maxLength={80} invalid={!!errors.brand_name} onChange={(e) => setData('brand_name', e.target.value)} />
                            </Field>
                            <MediaPicker
                                label="Logo"
                                hint="PNG, WebP o SVG con fondo transparente y letras claras (se ve sobre el video). Sin logo se usa el de PROINNOVATEC."
                                accept="image/png,image/webp,image/svg+xml"
                                kind="image"
                                currentUrl={home.logoUrl}
                                file={data.logo}
                                removed={data.remove_logo}
                                error={err('logo')}
                                onFile={(f) => setData('logo', f)}
                                onRemove={(v) => setData('remove_logo', v)}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Texto del botón" error={err('nav_cta.label')} hint="Déjalo vacío para ocultar el botón.">
                                    <TextInput value={data.nav_cta.label} maxLength={40} onChange={(e) => setData('nav_cta', { ...data.nav_cta, label: e.target.value })} />
                                </Field>
                                <Field label="Enlace" error={err('nav_cta.url')}>
                                    <TextInput value={data.nav_cta.url} placeholder="/contacto o #contacto" onChange={(e) => setData('nav_cta', { ...data.nav_cta, url: e.target.value })} />
                                </Field>
                            </div>
                        </Section>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 z-20 border-t lg:left-64 border-slate-200 bg-white/95 backdrop-blur">
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
                                disabled={form.processing || !!videoTooBig}
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

/** Submenú de una opción del menú, dentro del modal de edición. */
function SubmenuEditor({ items, onChange }: { items: MenuChild[]; onChange: (items: MenuChild[]) => void }) {
    const patch = (j: number, p: Partial<MenuChild>) => onChange(items.map((c, k) => (k === j ? { ...c, ...p } : c)));

    return (
        <div>
            <span className="mb-2 block text-sm font-medium text-slate-800">Submenú (opcional)</span>
            <ul className="space-y-3">
                {items.map((child, j) => (
                    <li key={j} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
                        <Field label="Texto">
                            <TextInput value={child.label} maxLength={60} onChange={(e) => patch(j, { label: e.target.value })} />
                        </Field>
                        <Field label="Enlace">
                            <TextInput value={child.url} placeholder="#seccion" onChange={(e) => patch(j, { url: e.target.value })} />
                        </Field>
                        <div className="flex gap-2 sm:col-span-2">
                            <SmallButton disabled={j === 0} onClick={() => onChange(move(items, j, j - 1))}>↑</SmallButton>
                            <SmallButton disabled={j === items.length - 1} onClick={() => onChange(move(items, j, j + 1))}>↓</SmallButton>
                            <SmallButton danger onClick={() => onChange(items.filter((_, k) => k !== j))}>Quitar</SmallButton>
                        </div>
                    </li>
                ))}
            </ul>
            {items.length < 10 && (
                <div className="mt-3">
                    <SmallButton onClick={() => onChange([...items, { label: '', url: '' }])}>+ Agregar al submenú</SmallButton>
                </div>
            )}
        </div>
    );
}
