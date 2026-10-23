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
    Toggle,
    TextInput,
} from '@/components/admin/fields';
import type { HeroButton, HomeContent, MenuChild, MenuItem } from '@/types';

type EditorData = {
    title: string;
    subtitle: string;
    buttons: HeroButton[];
    menu: MenuItem[];
    nav_cta: MenuChild;
    show_panel_link: boolean;
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
        title: home.title,
        subtitle: home.subtitle ?? '',
        buttons: home.buttons,
        menu: home.menu.map((m) => ({ ...m, visible: m.visible ?? true, show_children: m.show_children ?? true })),
        nav_cta: home.navCta ?? { label: '', url: '' },
        show_panel_link: home.showPanelLink ?? true,
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
                    video: null,
                    poster: null,
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

                        <Section title="Menú de navegación" description="Las opciones Soluciones (/soluciones) y Servicios (/servicios) muestran solas sus páginas en el desplegable; las demás pueden llevar un submenú propio.">
                            <ItemList<MenuItem>
                                items={data.menu}
                                max={8}
                                itemLabel="Opción"
                                blank={() => ({ label: '', url: '', children: [], visible: true, show_children: true })}
                                onChange={(items) => setData('menu', items)}
                                summary={(m) => ({
                                    title: m.label,
                                    subtitle: `${m.visible === false ? 'Oculta · ' : ''}${m.url || 'Sin enlace'}${m.children.length ? ` · ${m.show_children === false ? 'submenú oculto' : `${m.children.filter((c) => c.visible !== false).length} de ${m.children.length} en el submenú`}` : ''}`,
                                })}
                                rowExtra={(m, update) => (
                                    <Toggle
                                        checked={m.visible !== false}
                                        onChange={(visible) => update({ visible })}
                                        label={m.visible === false ? 'Oculta: pulsa para mostrarla' : 'Visible: pulsa para ocultarla'}
                                        compact
                                    />
                                )}
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
                                        <Toggle
                                            checked={d.visible !== false}
                                            onChange={(visible) => patch({ visible })}
                                            label="Mostrar en el menú"
                                            hint="Si la ocultas, deja de verse en la barra de menú y en el pie de página, pero no se borra: puedes volver a mostrarla."
                                        />
                                        <SubmenuEditor
                                            items={d.children}
                                            onChange={(children) => patch({ children })}
                                            parentUrl={d.url}
                                            show={d.show_children !== false}
                                            onShowChange={(show_children) => patch({ show_children })}
                                        />
                                    </>
                                )}
                            />

                            {/* El botón «Panel» del sitio: no es una opción del menú, pero se muestra u oculta igual que ellas. */}
                            <ul className="mt-3 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                                <li className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-4">
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-slate-900">Panel</span>
                                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                                            {data.show_panel_link ? '' : 'Oculto · '}/admin · botón de acceso a la administración (siempre al final, no se borra)
                                        </span>
                                    </span>
                                    <Toggle
                                        compact
                                        checked={data.show_panel_link}
                                        onChange={(value) => setData('show_panel_link', value)}
                                        label={data.show_panel_link ? 'Visible: pulsa para ocultarlo' : 'Oculto: pulsa para mostrarlo'}
                                    />
                                </li>
                            </ul>
                            <p className="mt-2 text-xs text-slate-500">Si ocultas el botón «Panel», se entra escribiendo /admin en la dirección.</p>
                        </Section>

                        <Section title="Botón del menú" description="Botón con contorno que aparece arriba a la derecha. El logo y el nombre de la marca se cambian en &quot;Datos de la empresa&quot;.">
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
/** Opciones cuyo submenú se arma solo (las soluciones de Enterprise y las categorías del blog). */
const AUTO_SUBMENU: Record<string, string> = {
    '/division-enterprise': 'las soluciones de la División Enterprise',
    '/blog': 'las categorías del blog',
};

function SubmenuEditor({
    items,
    onChange,
    parentUrl,
    show,
    onShowChange,
}: {
    items: MenuChild[];
    onChange: (items: MenuChild[]) => void;
    parentUrl: string;
    show: boolean;
    onShowChange: (value: boolean) => void;
}) {
    const patch = (j: number, p: Partial<MenuChild>) => onChange(items.map((c, k) => (k === j ? { ...c, ...p } : c)));
    const auto = AUTO_SUBMENU[parentUrl];
    const hidden = items.filter((c) => c.visible === false).length;

    return (
        <div className="space-y-3">
            <span className="block text-sm font-medium text-slate-800">Submenú</span>

            {(items.length > 0 || auto) && (
                <Toggle
                    checked={show}
                    onChange={onShowChange}
                    label="Mostrar el submenú desplegable"
                    hint="Si lo apagas, solo se ve la opción principal, sin desplegable. Las subopciones no se borran."
                />
            )}

            {auto && (
                <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    Este submenú se genera solo con {auto}. Aquí eliges cuáles se muestran
                    {hidden > 0 ? ` (${hidden} oculta${hidden === 1 ? '' : 's'})` : ''}.
                </p>
            )}

            <ul className={`space-y-2 ${show ? '' : 'opacity-50'}`}>
                {items.map((child, j) =>
                    auto ? (
                        <li key={`${child.url}-${j}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                            <span className="min-w-0">
                                <span className={`block truncate text-sm ${child.visible === false ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{child.label}</span>
                                <span className="block truncate text-xs text-slate-500">{child.url}</span>
                            </span>
                            <Toggle
                                compact
                                checked={child.visible !== false}
                                onChange={(visible) => patch(j, { visible })}
                                label={child.visible === false ? 'Oculta: pulsa para mostrarla' : 'Visible: pulsa para ocultarla'}
                            />
                        </li>
                    ) : (
                        <li key={j} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
                            <Field label="Texto">
                                <TextInput value={child.label} maxLength={60} onChange={(e) => patch(j, { label: e.target.value })} />
                            </Field>
                            <Field label="Enlace">
                                <TextInput value={child.url} placeholder="#seccion" onChange={(e) => patch(j, { url: e.target.value })} />
                            </Field>
                            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                                <SmallButton disabled={j === 0} onClick={() => onChange(move(items, j, j - 1))}>↑</SmallButton>
                                <SmallButton disabled={j === items.length - 1} onClick={() => onChange(move(items, j, j + 1))}>↓</SmallButton>
                                <SmallButton danger onClick={() => onChange(items.filter((_, k) => k !== j))}>Quitar</SmallButton>
                                <span className="ml-auto">
                                    <Toggle
                                        checked={child.visible !== false}
                                        onChange={(visible) => patch(j, { visible })}
                                        label={child.visible === false ? 'Oculta' : 'Visible'}
                                    />
                                </span>
                            </div>
                        </li>
                    ),
                )}
            </ul>

            {!auto && items.length < 10 && (
                <div>
                    <SmallButton onClick={() => onChange([...items, { label: '', url: '', visible: true }])}>+ Agregar al submenú</SmallButton>
                </div>
            )}
        </div>
    );
}
