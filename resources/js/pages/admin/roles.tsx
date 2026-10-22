import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { Field, SmallButton, TextArea, TextInput } from '@/components/admin/fields';
import { Modal } from '@/components/admin/modal';

type Permission = { key: string; label: string; description: string };
type Group = { key: string; label: string; description: string; permissions: Permission[] };
type RoleRow = {
    id: number;
    name: string;
    description: string | null;
    is_super: boolean;
    users_count: number;
    permissions: string[];
    is_mine: boolean;
};

const primaryBtn =
    'inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-40';
const ghostBtn =
    'inline-flex min-h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100';

export default function Roles({
    pages,
    roles,
    groups,
    requires,
    grantable,
    can_manage,
}: {
    pages: AdminPage[];
    roles: RoleRow[];
    groups: Group[];
    requires: Record<string, string>;
    grantable: string[];
    can_manage: boolean;
}) {
    // undefined = cerrado · null = rol nuevo · RoleRow = edición o vista
    const [editing, setEditing] = useState<RoleRow | null | undefined>(undefined);
    const total = groups.reduce((n, g) => n + g.permissions.length, 0);

    return (
        <>
            <Head title="Roles y permisos" />
            <AdminLayout pages={pages} current="roles">
                <div className="mx-auto max-w-5xl px-6 pb-16 pt-10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Roles y permisos</h1>
                            <p className="mt-2 max-w-prose text-sm text-slate-600">
                                Un rol es un conjunto de permisos. Crea los roles que necesites, elige qué puede hacer cada uno y luego asígnalos a las personas en{' '}
                                <a href="/admin/usuarios" className="underline underline-offset-2">Usuarios</a>.
                            </p>
                        </div>
                        {can_manage && (
                            <button type="button" onClick={() => setEditing(null)} className={primaryBtn}>
                                Nuevo rol
                            </button>
                        )}
                    </div>

                    <ul className="mt-8 grid gap-4 md:grid-cols-2">
                        {roles.map((r) => (
                            <li key={r.id}>
                                <button
                                    type="button"
                                    onClick={() => setEditing(r)}
                                    className="flex h-full w-full flex-col rounded-lg bg-white p-5 text-left ring-1 ring-slate-200 transition-shadow hover:shadow-md"
                                >
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="text-base font-semibold text-slate-900">{r.name}</span>
                                        {r.is_super && <span className="rounded-full bg-night px-2.5 py-0.5 text-xs font-semibold text-white">Acceso total</span>}
                                        {r.is_mine && <span className="rounded-full bg-signal/25 px-2.5 py-0.5 text-xs font-semibold text-night">Tu rol</span>}
                                    </span>
                                    {r.description && <span className="mt-1.5 text-sm text-slate-600">{r.description}</span>}
                                    <span className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                                        <span>{r.is_super ? `${total} de ${total}` : `${r.permissions.length} de ${total}`} permisos</span>
                                        <span>
                                            {r.users_count} {r.users_count === 1 ? 'usuario' : 'usuarios'}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <h2 className="mt-14 text-base font-semibold text-slate-900">Resumen por rol</h2>
                    <p className="mt-1.5 max-w-prose text-sm text-slate-600">
                        Todos los roles pueden cambiar sus propios datos y contraseña en «Mi cuenta».
                    </p>
                    <div className="mt-5 overflow-x-auto rounded-lg bg-white ring-1 ring-slate-200">
                        <table className="w-full min-w-[34rem] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs text-slate-500">
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Permiso
                                    </th>
                                    {roles.map((r) => (
                                        <th key={r.id} scope="col" className="px-3 py-3 text-center font-medium">
                                            {r.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((g) => (
                                    <GroupRows key={g.key} group={g} roles={roles} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {editing !== undefined && (
                    <RoleEditor
                        key={editing?.id ?? 'new'}
                        role={editing}
                        groups={groups}
                        requires={requires}
                        grantable={grantable}
                        canManage={can_manage}
                        onClose={() => setEditing(undefined)}
                    />
                )}
            </AdminLayout>
        </>
    );
}

function GroupRows({ group, roles }: { group: Group; roles: RoleRow[] }) {
    return (
        <>
            <tr className="bg-slate-50">
                <th colSpan={roles.length + 1} scope="colgroup" className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                </th>
            </tr>
            {group.permissions.map((p) => (
                <tr key={p.key} className="border-t border-slate-100">
                    <th scope="row" className="px-4 py-2.5 font-medium text-slate-800">
                        {p.label}
                    </th>
                    {roles.map((r) => {
                        const yes = r.is_super || r.permissions.includes(p.key);

                        return (
                            <td key={r.id} className="px-3 py-2.5 text-center">
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
        </>
    );
}

function RoleEditor({
    role,
    groups,
    requires,
    grantable,
    canManage,
    onClose,
}: {
    role: RoleRow | null;
    groups: Group[];
    requires: Record<string, string>;
    grantable: string[];
    canManage: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.is_super ? groups.flatMap((g) => g.permissions.map((p) => p.key)) : (role?.permissions ?? []),
    });

    // Solo se edita un rol que no es el de acceso total ni el propio, y si se tiene el permiso de gestionar roles.
    const locked = !canManage || Boolean(role?.is_super) || Boolean(role?.is_mine);
    const reason = !role
        ? null
        : role.is_super
          ? 'El rol Administrador tiene acceso total y no se puede modificar.'
          : role.is_mine
            ? 'Es tu propio rol: pídele a otra persona con acceso que lo cambie.'
            : !canManage
              ? 'Puedes ver este rol, pero no tienes permiso para modificarlo.'
              : null;

    const has = (key: string) => form.data.permissions.includes(key);
    // Errores que no son de un campo (reglas de seguridad del servidor), también al eliminar.
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const generalError = deleteError ?? (form.errors as Record<string, string | undefined>).role;

    const toggle = (key: string, on: boolean) => {
        let next = new Set(form.data.permissions);

        if (on) {
            next.add(key);
            // Lo que este permiso necesita (ver antes de editar).
            if (requires[key]) next.add(requires[key]);
        } else {
            next.delete(key);
            // Si se quita «ver», se quitan las acciones que dependen de verlo.
            for (const [dep, need] of Object.entries(requires)) {
                if (need === key) next.delete(dep);
            }
        }

        form.setData('permissions', Array.from(next));
    };

    const toggleGroup = (g: Group, on: boolean) => {
        const keys = g.permissions.map((p) => p.key).filter((k) => on ? grantable.includes(k) || has(k) : true);
        let next = new Set(form.data.permissions);

        for (const k of keys) {
            if (on) next.add(k);
            else next.delete(k);
        }

        form.setData('permissions', Array.from(next));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(role ? `/admin/roles/${role.id}` : '/admin/roles', { preserveScroll: true, onSuccess: onClose });
    };

    const remove = () => {
        if (role && window.confirm(`¿Eliminar el rol «${role.name}»? Esta acción no se puede deshacer.`)) {
            router.delete(`/admin/roles/${role.id}`, {
                preserveScroll: true,
                onSuccess: onClose,
                onError: (errors) => setDeleteError(Object.values(errors)[0] ?? 'No se pudo eliminar el rol.'),
            });
        }
    };

    const canDelete = Boolean(role) && !locked && (role?.users_count ?? 0) === 0;
    const permissionError = form.errors.permissions ?? Object.entries(form.errors).find(([k]) => k.startsWith('permissions.'))?.[1];

    return (
        <Modal
            open
            title={role ? (locked ? role.name : 'Editar rol') : 'Nuevo rol'}
            onClose={onClose}
            footer={
                <>
                    {role && !locked && (
                        <span title={canDelete ? undefined : 'Hay usuarios con este rol: cámbiales el rol antes de eliminarlo.'}>
                            <SmallButton danger disabled={!canDelete} onClick={remove}>
                                Eliminar
                            </SmallButton>
                        </span>
                    )}
                    <button type="button" onClick={onClose} className={ghostBtn}>
                        {locked ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!locked && (
                        <button type="submit" form="role-form" disabled={form.processing || !form.data.name.trim()} className={primaryBtn}>
                            {form.processing ? 'Guardando…' : role ? 'Guardar cambios' : 'Crear rol'}
                        </button>
                    )}
                </>
            }
        >
            <form id="role-form" onSubmit={submit} className="space-y-6">
                {reason && <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">{reason}</p>}
                {generalError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{generalError}</p>}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre del rol" error={form.errors.name}>
                        <TextInput value={form.data.name} maxLength={60} disabled={locked} autoFocus={!locked} onChange={(e) => form.setData('name', e.target.value)} />
                    </Field>
                    <Field label="Descripción (opcional)" error={form.errors.description}>
                        <TextArea rows={1} value={form.data.description} maxLength={255} disabled={locked} onChange={(e) => form.setData('description', e.target.value)} />
                    </Field>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Permisos</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Marca lo que este rol puede hacer. Solo puedes dar permisos que tú también tienes.
                    </p>
                    {permissionError && <p role="alert" className="mt-2 text-xs text-red-700">{permissionError}</p>}

                    <div className="mt-4 space-y-5">
                        {groups.map((g) => {
                            const keys = g.permissions.map((p) => p.key);
                            const marked = keys.filter(has).length;

                            return (
                                <fieldset key={g.key} className="rounded-lg border border-slate-200">
                                    <legend className="sr-only">{g.label}</legend>
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                                        <div>
                                            <span className="text-sm font-semibold text-slate-900">{g.label}</span>
                                            <span className="ml-2 text-xs text-slate-500">
                                                {marked} de {keys.length}
                                            </span>
                                        </div>
                                        {!locked && (
                                            <button
                                                type="button"
                                                onClick={() => toggleGroup(g, marked < keys.length)}
                                                className="text-xs font-medium text-signal-deep underline-offset-2 hover:underline"
                                            >
                                                {marked < keys.length ? 'Marcar todo' : 'Quitar todo'}
                                            </button>
                                        )}
                                    </div>
                                    <ul className="divide-y divide-slate-100">
                                        {g.permissions.map((p) => {
                                            const disabled = locked || (!grantable.includes(p.key) && !has(p.key));

                                            return (
                                                <li key={p.key}>
                                                    <label className={`flex items-start gap-3 px-4 py-3 text-sm ${disabled ? 'opacity-60' : 'cursor-pointer hover:bg-slate-50'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={has(p.key)}
                                                            disabled={disabled}
                                                            onChange={(e) => toggle(p.key, e.target.checked)}
                                                            className="mt-0.5 size-4 accent-[#0891b2]"
                                                        />
                                                        <span>
                                                            <span className="font-medium text-slate-900">{p.label}</span>
                                                            <span className="block text-xs text-slate-500">{p.description}</span>
                                                            {!locked && !grantable.includes(p.key) && !has(p.key) && (
                                                                <span className="block text-xs text-amber-700">No puedes dar este permiso porque tú no lo tienes.</span>
                                                            )}
                                                        </span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </fieldset>
                            );
                        })}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
