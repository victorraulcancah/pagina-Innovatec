import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { Field, Select, SmallButton, TextInput } from '@/components/admin/fields';
import { Modal } from '@/components/admin/modal';

type RoleOption = { id: number; name: string; description: string | null; assignable: boolean };
type AdminUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    roleName: string;
    roleSuper: boolean;
    active: boolean;
    isSelf: boolean;
    editable: boolean;
    created: string | null;
};
type Can = { create: boolean; edit: boolean; delete: boolean; roles: boolean };

const primaryBtn =
    'inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-40';
const ghostBtn =
    'inline-flex min-h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100';

export default function Users({
    pages,
    users,
    roles,
    can,
}: {
    pages: AdminPage[];
    users: AdminUser[];
    roles: RoleOption[];
    can: Can;
}) {
    // undefined = cerrado · null = usuario nuevo · AdminUser = edición
    const [editing, setEditing] = useState<AdminUser | null | undefined>(undefined);

    return (
        <>
            <Head title="Usuarios" />
            <AdminLayout pages={pages} current="usuarios">
                <div className="mx-auto max-w-5xl px-6 pb-16 pt-10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
                            <p className="mt-2 max-w-prose text-sm text-slate-600">
                                Quién entra al panel y con qué rol. Lo que puede hacer cada persona lo define su rol.
                                {can.roles && (
                                    <>
                                        {' '}
                                        Para crear roles o cambiar sus permisos ve a{' '}
                                        <a href="/admin/roles" className="underline underline-offset-2">
                                            Roles y permisos
                                        </a>
                                        .
                                    </>
                                )}
                            </p>
                        </div>
                        {can.create && (
                            <button type="button" onClick={() => setEditing(null)} className={primaryBtn}>
                                Nuevo usuario
                            </button>
                        )}
                    </div>

                    <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                        {users.map((u) => {
                            const open = can.edit && u.editable;

                            return (
                                <li key={u.id}>
                                    <button
                                        type="button"
                                        disabled={!open}
                                        onClick={() => setEditing(u)}
                                        title={!open && can.edit ? 'Tiene más permisos que tú: no puedes modificarlo.' : undefined}
                                        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-left transition-colors enabled:hover:bg-slate-50 disabled:cursor-default"
                                    >
                                        <span className="min-w-0 flex-1 basis-56">
                                            <span className={`block truncate text-sm font-medium ${u.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                                {u.name}
                                                {u.isSelf && <span className="ml-2 text-xs font-normal text-slate-500 no-underline">(tú)</span>}
                                            </span>
                                            <span className="block truncate text-sm text-slate-500">{u.email}</span>
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.roleSuper ? 'bg-night text-white' : 'bg-slate-200 text-slate-800'}`}>
                                            {u.roleName}
                                        </span>
                                        <span className={`w-20 text-right text-xs ${u.active ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {u.active ? 'Activo' : 'Desactivado'}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {editing !== undefined && (
                    <UserEditor key={editing?.id ?? 'new'} user={editing} roles={roles} can={can} onClose={() => setEditing(undefined)} />
                )}
            </AdminLayout>
        </>
    );
}

function UserEditor({ user, roles, can, onClose }: { user: AdminUser | null; roles: RoleOption[]; can: Can; onClose: () => void }) {
    const firstAssignable = roles.find((r) => r.assignable) ?? roles[0];
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role_id: String(user?.role_id ?? firstAssignable?.id ?? ''),
        active: user?.active ?? true,
        password: '',
        password_confirmation: '',
    });

    const self = user?.isSelf ?? false;
    // Errores que no son de un campo (reglas de seguridad del servidor), también al eliminar.
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const generalError = deleteError ?? (form.errors as Record<string, string | undefined>).user;
    const current = roles.find((r) => String(r.id) === form.data.role_id);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(user ? `/admin/usuarios/${user.id}` : '/admin/usuarios', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const remove = () => {
        if (user && window.confirm(`¿Eliminar a ${user.name}? Perderá el acceso al panel y esta acción no se puede deshacer.`)) {
            router.delete(`/admin/usuarios/${user.id}`, {
                preserveScroll: true,
                onSuccess: onClose,
                onError: (errors) => setDeleteError(Object.values(errors)[0] ?? 'No se pudo eliminar al usuario.'),
            });
        }
    };

    return (
        <Modal
            open
            title={user ? 'Editar usuario' : 'Nuevo usuario'}
            onClose={onClose}
            footer={
                <>
                    {user && !self && can.delete && (
                        <SmallButton danger onClick={remove}>
                            Eliminar
                        </SmallButton>
                    )}
                    <button type="button" onClick={onClose} className={ghostBtn}>
                        Cancelar
                    </button>
                    <button type="submit" form="user-form" disabled={form.processing} className={primaryBtn}>
                        {form.processing ? 'Guardando…' : user ? 'Guardar cambios' : 'Crear usuario'}
                    </button>
                </>
            }
        >
            <form id="user-form" onSubmit={submit} className="space-y-5">
                {generalError && (
                    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {generalError}
                    </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre" error={form.errors.name}>
                        <TextInput value={form.data.name} maxLength={120} autoFocus autoComplete="off" onChange={(e) => form.setData('name', e.target.value)} />
                    </Field>
                    <Field label="Correo de acceso" error={form.errors.email}>
                        <TextInput type="email" value={form.data.email} autoComplete="off" onChange={(e) => form.setData('email', e.target.value)} />
                    </Field>
                </div>

                <Field
                    label="Rol"
                    hint={self ? 'No puedes cambiar tu propio rol.' : (current?.description ?? undefined)}
                    error={form.errors.role_id}
                >
                    <Select value={form.data.role_id} disabled={self} onChange={(e) => form.setData('role_id', e.target.value)}>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id} disabled={!r.assignable && String(r.id) !== String(user?.role_id)}>
                                {r.name}
                                {!r.assignable && String(r.id) !== String(user?.role_id) ? ' (más permisos que los tuyos)' : ''}
                            </option>
                        ))}
                    </Select>
                </Field>
                {can.roles && (
                    <p className="-mt-3 text-xs text-slate-500">
                        ¿Necesitas otro rol? Créalo en{' '}
                        <a href="/admin/roles" className="underline underline-offset-2">
                            Roles y permisos
                        </a>
                        .
                    </p>
                )}

                {user && (
                    <div>
                        <label className="flex items-start gap-3 text-sm text-slate-800">
                            <input
                                type="checkbox"
                                checked={form.data.active}
                                disabled={self}
                                onChange={(e) => form.setData('active', e.target.checked)}
                                className="mt-0.5 size-4 accent-[#0891b2]"
                            />
                            <span>
                                Cuenta activa
                                <span className="block text-xs text-slate-500">
                                    {self ? 'No puedes desactivar tu propia cuenta.' : 'Si la desactivas, no podrá entrar al panel (sus datos se conservan).'}
                                </span>
                            </span>
                        </label>
                        {form.errors.active && (
                            <span role="alert" className="mt-1.5 block text-xs text-red-700">
                                {form.errors.active}
                            </span>
                        )}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label={user ? 'Contraseña nueva' : 'Contraseña'}
                        hint={user ? 'Déjala en blanco para no cambiarla.' : 'Mínimo 10 caracteres, con letras y números.'}
                        error={form.errors.password}
                    >
                        <TextInput type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    </Field>
                    <Field label="Repite la contraseña">
                        <TextInput type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                    </Field>
                </div>
            </form>
        </Modal>
    );
}
