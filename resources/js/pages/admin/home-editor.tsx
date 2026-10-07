import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
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
                            <ul className="space-y-4">
                                {data.buttons.map((button, i) => (
                                    <li key={i} className="grid gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-[1fr_1fr_130px]">
                                        <Field label="Texto" error={err(`buttons.${i}.label`)}>
                                            <TextInput value={button.label} maxLength={40} onChange={(e) => setButton(i, { label: e.target.value })} />
                                        </Field>
                                        <Field label="Enlace" error={err(`buttons.${i}.url`)}>
                                            <TextInput value={button.url} placeholder="/contacto o #seccion" onChange={(e) => setButton(i, { url: e.target.value })} />
                                        </Field>
                                        <Field label="Estilo">
                                            <Select value={button.variant} onChange={(e) => setButton(i, { variant: e.target.value as HeroButton['variant'] })}>
                                                <option value="primary">Relleno</option>
                                                <option value="outline">Contorno</option>
                                            </Select>
                                        </Field>
                                        <div className="flex gap-2 sm:col-span-3">
                                            <SmallButton disabled={i === 0} onClick={() => setData('buttons', move(data.buttons, i, i - 1))}>Subir</SmallButton>
                                            <SmallButton disabled={i === data.buttons.length - 1} onClick={() => setData('buttons', move(data.buttons, i, i + 1))}>Bajar</SmallButton>
                                            <SmallButton danger onClick={() => setData('buttons', data.buttons.filter((_, k) => k !== i))}>Eliminar</SmallButton>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {data.buttons.length < 3 && (
                                <SmallButton onClick={() => setData('buttons', [...data.buttons, { label: '', url: '', variant: 'outline' }])}>
                                    + Agregar botón
                                </SmallButton>
                            )}
                        </Section>

                        <Section title="Menú de navegación" description="Cada opción puede tener un submenú desplegable.">
                            <ul className="space-y-4">
                                {data.menu.map((item, i) => (
                                    <li key={i} className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Field label="Texto" error={err(`menu.${i}.label`)}>
                                                <TextInput value={item.label} maxLength={40} onChange={(e) => setMenuItem(i, { label: e.target.value })} />
                                            </Field>
                                            <Field label="Enlace" error={err(`menu.${i}.url`)}>
                                                <TextInput value={item.url} placeholder="/nosotros o #seccion" onChange={(e) => setMenuItem(i, { url: e.target.value })} />
                                            </Field>
                                        </div>

                                        {item.children.length > 0 && (
                                            <ul className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                                                {item.children.map((child, j) => (
                                                    <li key={j} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                                                        <Field label="Submenú" error={err(`menu.${i}.children.${j}.label`)}>
                                                            <TextInput value={child.label} maxLength={60} onChange={(e) => setChild(i, j, { label: e.target.value })} />
                                                        </Field>
                                                        <Field label="Enlace" error={err(`menu.${i}.children.${j}.url`)}>
                                                            <TextInput value={child.url} onChange={(e) => setChild(i, j, { url: e.target.value })} />
                                                        </Field>
                                                        <div className="flex items-end gap-2">
                                                            <SmallButton disabled={j === 0} onClick={() => setMenuItem(i, { children: move(item.children, j, j - 1) })}>↑</SmallButton>
                                                            <SmallButton disabled={j === item.children.length - 1} onClick={() => setMenuItem(i, { children: move(item.children, j, j + 1) })}>↓</SmallButton>
                                                            <SmallButton danger onClick={() => setMenuItem(i, { children: item.children.filter((_, k) => k !== j) })}>Quitar</SmallButton>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <SmallButton onClick={() => setMenuItem(i, { children: [...item.children, { label: '', url: '' }] })}>+ Submenú</SmallButton>
                                            <SmallButton disabled={i === 0} onClick={() => setData('menu', move(data.menu, i, i - 1))}>Subir</SmallButton>
                                            <SmallButton disabled={i === data.menu.length - 1} onClick={() => setData('menu', move(data.menu, i, i + 1))}>Bajar</SmallButton>
                                            <SmallButton danger onClick={() => setData('menu', data.menu.filter((_, k) => k !== i))}>Eliminar opción</SmallButton>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {data.menu.length < 8 && (
                                <SmallButton onClick={() => setData('menu', [...data.menu, { label: '', url: '', children: [] }])}>
                                    + Agregar opción
                                </SmallButton>
                            )}
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

                    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
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
