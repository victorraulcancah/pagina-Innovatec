import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { Field, Select, SmallButton, TextInput } from '@/components/admin/fields';
import { Modal } from '@/components/admin/modal';

type Role = { value: string; label: string; description: string; permissions: string[] };
type Permission = { value: string; label: string; description: string };
type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    roleLabel: string;
    active: boolean;
    isSelf: boolean;
    created: string | null;
};

const primaryBtn =
    'inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-40';
const ghostBtn =
    'inline-flex min-h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100';

const roleTone: Record<string, string> = {
    admin: 'bg-night text-white',
    editor: 'bg-signal/20 text-night',
    redactor: 'bg-slate-200 text-slate-800',
    comercial: 'bg-amber-100 text-amber-900',
};

export default function Users({
    pages,
    users,
    roles,
    permissions,
}: {
    pages: AdminPage[];
    users: AdminUser[];
    roles: Role[];
    permissions: Permission[];
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
                                Quién entra al panel y qué puede hacer. El rol define las áreas a las que cada persona tiene acceso.
                            </p>
                        </div>
                        <button type="button" onClick={() => setEditing(null)} className={primaryBtn}>
                            Nuevo usuario
                        </button>
                    </div>

                    <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                        {users.map((u) => (
                            <li key={u.id}>
                                <button
                                    type="button"
                                    onClick={() => setEditing(u)}
                                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-left transition-colors hover:bg-slate-50"
                                >
                                    <span className="min-w-0 flex-1 basis-56">
                                        <span className={`block truncate text-sm font-medium ${u.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                            {u.name}
                                            {u.isSelf && <span className="ml-2 text-xs font-normal text-slate-500 no-underline">(tú)</span>}
                                        </span>
                                        <span className="block truncate text-sm text-slate-500">{u.email}</span>
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleTone[u.role] ?? 'bg-slate-200 text-slate-800'}`}>
                                        {u.roleLabel}
                                    </span>
                                    <span className={`w-20 text-right text-xs ${u.active ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {u.active ? 'Activo' : 'Desactivado'}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <h2 className="mt-14 text-base font-semibold text-slate-900">Qué puede hacer cada rol</h2>
                    <p className="mt-1.5 max-w-prose text-sm text-slate-600">
                        Todos los roles pueden cambiar sus propios datos y contraseña en «Mi cuenta».
                    </p>
                    <div className="mt-5 overflow-x-auto rounded-lg bg-white ring-1 ring-slate-200">
                        <table className="w-full min-w-[34rem] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs text-slate-500">
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Área del panel
                                    </th>
                                    {roles.map((r) => (
                                        <th key={r.value} scope="col" className="px-3 py-3 text-center font-medium">
                                            {r.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {permissions.map((p) => (
                                    <tr key={p.value}>
                                        <th scope="row" className="px-4 py-3 font-medium text-slate-800">
                                            {p.label}
                                            <span className="mt-0.5 block text-xs font-normal text-slate-500">{p.description}</span>
                                        </th>
                                        {roles.map((r) => {
                                            const yes = r.permissions.includes(p.value);

                                            return (
                                                <td key={r.value} className="px-3 py-3 text-center">
                                                    {yes ? (
                                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="mx-auto text-emerald-600" role="img" aria-label="Sí">
                                                            <path d="M4 10.500l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    ) : (
                                                        <span className="text-slate-300" role="img" aria-label="No">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {editing !== undefined && (
                    <UserEditor key={editing?.id ?? 'new'} user={editing} roles={roles} onClose={() => setEditing(undefined)} />
                )}
            </AdminLayout>
        </>
    );
}

function UserEditor({ user, roles, onClose }: { user: AdminUser | null; roles: Role[]; onClose: () => void }) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'redactor',
        active: user?.active ?? true,
        password: '',
        password_confirmation: '',
    });

    const self = user?.isSelf ?? false;
    const current = roles.find((r) => r.value === form.data.role);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(user ? `/admin/usuarios/${user.id}` : '/admin/usuarios', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const remove = () => {
        if (user && window.confirm(`¿Eliminar a ${user.name}? Perderá el acceso al panel y esta acción no se puede deshacer.`)) {
            router.delete(`/admin/usuarios/${user.id}`, { preserveScroll: true, onSuccess: onClose });
        }
    };

    return (
        <Modal
            open
            title={user ? 'Editar usuario' : 'Nuevo usuario'}
            onClose={onClose}
            footer={
                <>
                    {user && !self && (
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
                    hint={self ? 'No puedes cambiar tu propio rol.' : current?.description}
                    error={form.errors.role}
                >
                    <Select value={form.data.role} disabled={self} onChange={(e) => form.setData('role', e.target.value)}>
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </Select>
                </Field>

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
