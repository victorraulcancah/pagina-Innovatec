import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { Field, Section, TextInput } from '@/components/admin/fields';

export default function Account({ pages, account }: { pages: AdminPage[]; account: { name: string; email: string } }) {
    const form = useForm({
        name: account.name,
        email: account.email,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/cuenta', {
            preserveScroll: true,
            onSuccess: () => form.reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Mi cuenta" />
            <AdminLayout pages={pages} current="cuenta">
                <form onSubmit={submit} className="mx-auto max-w-5xl px-6 pb-32 pt-10">
                    <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
                    <p className="mt-2 max-w-prose text-sm text-slate-600">
                        Tus datos de acceso al panel. Para cambiar cualquier dato debes confirmar tu contraseña actual.
                    </p>

                    <div className="mt-10">
                        <Section title="Datos">
                            <Field label="Nombre" error={form.errors.name}>
                                <TextInput value={form.data.name} maxLength={120} autoComplete="name" onChange={(e) => form.setData('name', e.target.value)} />
                            </Field>
                            <Field label="Correo de acceso" error={form.errors.email}>
                                <TextInput type="email" value={form.data.email} autoComplete="username" onChange={(e) => form.setData('email', e.target.value)} />
                            </Field>
                        </Section>

                        <Section title="Contraseña" description="Déjala en blanco si no quieres cambiarla.">
                            <Field label="Contraseña nueva" hint="Mínimo 10 caracteres, con letras y números." error={form.errors.password}>
                                <TextInput type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                            </Field>
                            <Field label="Repite la contraseña nueva">
                                <TextInput type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                            </Field>
                        </Section>

                        <Section title="Confirmar" description="Obligatorio para guardar.">
                            <Field label="Contraseña actual" error={form.errors.current_password}>
                                <TextInput type="password" autoComplete="current-password" value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} />
                            </Field>
                        </Section>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
                        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
                            <p aria-live="polite" className="text-sm text-slate-600">
                                {form.processing ? 'Guardando…' : form.hasErrors ? 'Revisa los campos marcados en rojo.' : form.recentlySuccessful ? 'Cuenta actualizada.' : ''}
                            </p>
                            <button
                                type="submit"
                                disabled={form.processing || !form.data.current_password}
                                className="inline-flex min-h-11 items-center rounded-full bg-night px-7 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-50"
                            >
                                Guardar cuenta
                            </button>
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </>
    );
}
