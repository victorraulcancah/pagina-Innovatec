import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { Field, Section, Select, SmallButton, TextArea, TextInput } from '@/components/admin/fields';
import { MediaPicker } from '@/components/admin/media-picker';
import { Modal } from '@/components/admin/modal';

type Category = { id: number; name: string; posts: number };

type Post = {
    id: number;
    title: string;
    category_id: number;
    category: string;
    excerpt: string;
    body: string;
    coverUrl: string | null;
    published: boolean;
    published_at: string | null;
    date: string | null;
    scheduled: boolean;
};

const primaryBtn =
    'inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-40';
const ghostBtn =
    'inline-flex min-h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100';

export default function BlogAdmin({
    pages,
    categories,
    posts,
}: {
    pages: AdminPage[];
    categories: Category[];
    posts: Post[];
}) {
    const [editingPost, setEditingPost] = useState<Post | 'new' | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | 'new' | null>(null);
    const { errors } = usePage().props as { errors: Record<string, string> };

    const removePost = (p: Post) => {
        if (window.confirm(`¿Eliminar la publicación "${p.title}"? No se puede deshacer.`)) {
            router.delete(`/admin/blog/posts/${p.id}`, { preserveScroll: true });
        }
    };

    const removeCategory = (c: Category) => {
        if (window.confirm(`¿Eliminar la categoría "${c.name}"?`)) {
            router.delete(`/admin/blog/categories/${c.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Blog" />
            <AdminLayout pages={pages} current="blog">
                <div className="mx-auto max-w-5xl px-6 pb-16 pt-10">
                    <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
                    <p className="mt-2 max-w-prose text-sm text-slate-600">
                        Publica novedades, eventos y tendencias. Cada publicación se guarda al instante; no hace falta otro botón.
                    </p>

                    <div className="mt-10">
                        <Section title="Categorías" description="Aparecen como desplegable de Blog en el menú del sitio.">
                            {errors.category && (
                                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                                    {errors.category}
                                </p>
                            )}
                            <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                                {categories.map((c) => (
                                    <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">{c.name}</span>
                                            <span className="block text-xs text-slate-500">
                                                {c.posts} {c.posts === 1 ? 'publicación' : 'publicaciones'}
                                            </span>
                                        </span>
                                        <SmallButton onClick={() => setEditingCategory(c)}>Renombrar</SmallButton>
                                        <SmallButton danger disabled={c.posts > 0} onClick={() => removeCategory(c)}>
                                            Eliminar
                                        </SmallButton>
                                    </li>
                                ))}
                            </ul>
                            <SmallButton onClick={() => setEditingCategory('new')}>+ Agregar categoría</SmallButton>
                        </Section>

                        <Section title="Publicaciones" description="Borrador: solo la ves tú. Publicada: aparece en el sitio desde su fecha.">
                            {posts.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                                    Todavía no hay publicaciones.
                                </p>
                            ) : (
                                <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                                    {posts.map((p) => (
                                        <li key={p.id} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-4">
                                            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
                                                {p.coverUrl && <img src={p.coverUrl} alt="" className="size-full object-cover" />}
                                            </span>
                                            <button type="button" onClick={() => setEditingPost(p)} className="min-w-0 flex-1 text-left">
                                                <span className="block truncate text-sm font-medium">{p.title}</span>
                                                <span className="mt-0.5 block truncate text-xs text-slate-500">
                                                    {p.category}
                                                    {p.date ? ` · ${p.date}` : ''}
                                                </span>
                                            </button>
                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    !p.published
                                                        ? 'bg-slate-100 text-slate-600'
                                                        : p.scheduled
                                                          ? 'bg-amber-100 text-amber-800'
                                                          : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                            >
                                                {!p.published ? 'Borrador' : p.scheduled ? 'Programada' : 'Publicada'}
                                            </span>
                                            <div className="flex shrink-0 gap-1.5">
                                                <SmallButton onClick={() => setEditingPost(p)}>Editar</SmallButton>
                                                <SmallButton danger onClick={() => removePost(p)}>
                                                    Eliminar
                                                </SmallButton>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <SmallButton onClick={() => setEditingPost('new')} disabled={categories.length === 0}>
                                + Nueva publicación
                            </SmallButton>
                            {categories.length === 0 && (
                                <p className="text-xs text-slate-500">Crea primero una categoría.</p>
                            )}
                        </Section>
                    </div>
                </div>

                {editingPost && (
                    <PostEditor
                        key={editingPost === 'new' ? 'new' : editingPost.id}
                        post={editingPost === 'new' ? null : editingPost}
                        categories={categories}
                        onClose={() => setEditingPost(null)}
                    />
                )}
                {editingCategory && (
                    <CategoryEditor
                        key={editingCategory === 'new' ? 'new' : editingCategory.id}
                        category={editingCategory === 'new' ? null : editingCategory}
                        onClose={() => setEditingCategory(null)}
                    />
                )}
            </AdminLayout>
        </>
    );
}

function PostEditor({ post, categories, onClose }: { post: Post | null; categories: Category[]; onClose: () => void }) {
    const form = useForm({
        title: post?.title ?? '',
        blog_category_id: String(post?.category_id ?? categories[0]?.id ?? ''),
        excerpt: post?.excerpt ?? '',
        body: post?.body ?? '',
        status: post ? (post.published ? 'published' : 'draft') : 'draft',
        published_at: post?.published_at ?? '',
        cover: null as File | null,
        remove_cover: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(post ? `/admin/blog/posts/${post.id}` : '/admin/blog/posts', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Modal
            open
            title={post ? 'Editar publicación' : 'Nueva publicación'}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className={ghostBtn}>
                        Cancelar
                    </button>
                    <button type="submit" form="post-form" disabled={form.processing} className={primaryBtn}>
                        {form.processing ? 'Guardando…' : form.data.status === 'published' ? 'Publicar' : 'Guardar borrador'}
                    </button>
                </>
            }
        >
            <form id="post-form" onSubmit={submit} className="space-y-5">
                <Field label="Título" error={form.errors.title}>
                    <TextInput value={form.data.title} maxLength={160} onChange={(e) => form.setData('title', e.target.value)} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Categoría" error={form.errors.blog_category_id}>
                        <Select value={form.data.blog_category_id} onChange={(e) => form.setData('blog_category_id', e.target.value)}>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Estado" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                            <option value="draft">Borrador</option>
                            <option value="published">Publicada</option>
                        </Select>
                    </Field>
                </div>
                {form.data.status === 'published' && (
                    <Field label="Fecha de publicación" hint="Déjala vacía para publicar ahora. Con una fecha futura, se publica ese día." error={form.errors.published_at}>
                        <TextInput type="datetime-local" value={form.data.published_at} onChange={(e) => form.setData('published_at', e.target.value)} />
                    </Field>
                )}
                <Field label="Resumen" hint="Una o dos frases que se ven en las tarjetas y al compartir." error={form.errors.excerpt}>
                    <TextArea rows={2} maxLength={300} value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} />
                </Field>
                <Field
                    label="Texto"
                    hint='Separa los párrafos con una línea en blanco. Usa "## Título" para un subtítulo y "- " al inicio de cada línea para una lista.'
                    error={form.errors.body}
                >
                    <TextArea rows={12} value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} />
                </Field>
                <MediaPicker
                    label="Imagen de portada"
                    hint="JPG, PNG o WebP, hasta 5 MB."
                    accept="image/jpeg,image/png,image/webp"
                    kind="image"
                    currentUrl={post?.coverUrl ?? null}
                    file={form.data.cover}
                    removed={form.data.remove_cover}
                    error={form.errors.cover}
                    onFile={(f) => form.setData('cover', f)}
                    onRemove={(v) => form.setData('remove_cover', v)}
                />
            </form>
        </Modal>
    );
}

function CategoryEditor({ category, onClose }: { category: Category | null; onClose: () => void }) {
    const form = useForm({ name: category?.name ?? '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(category ? `/admin/blog/categories/${category.id}` : '/admin/blog/categories', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Modal
            open
            title={category ? 'Renombrar categoría' : 'Agregar categoría'}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className={ghostBtn}>
                        Cancelar
                    </button>
                    <button type="submit" form="category-form" disabled={form.processing || !form.data.name.trim()} className={primaryBtn}>
                        Guardar
                    </button>
                </>
            }
        >
            <form id="category-form" onSubmit={submit}>
                <Field label="Nombre" error={form.errors.name}>
                    <TextInput value={form.data.name} maxLength={60} autoFocus onChange={(e) => form.setData('name', e.target.value)} />
                </Field>
            </form>
        </Modal>
    );
}
