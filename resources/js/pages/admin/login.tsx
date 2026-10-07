import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function Login() {
    const form = useForm({ email: '', password: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/login', {
            onFinish: () => form.setData('password', ''),
        });
    };

    const field =
        'block w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-red-400';

    return (
        <>
            <Head title="Ingresar al panel" />
            <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_60%_70%_at_70%_30%,#0b2f78_0%,#050b1a_70%)] px-6 py-12">
                <form onSubmit={submit} className="w-full max-w-sm">
                    <img
                        src="/brand/logo-light.png"
                        alt="PROINNOVATEC by Grupo CAME"
                        className="mb-10 h-10 w-auto"
                    />
                    <h1 className="font-display text-xl uppercase text-white">
                        Panel de administración
                    </h1>

                    <div className="mt-8 space-y-5">
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-white/80">Correo</span>
                            <input
                                type="email"
                                autoComplete="username"
                                autoFocus
                                required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                aria-invalid={!!form.errors.email || undefined}
                                className={field}
                            />
                            {form.errors.email && (
                                <span role="alert" className="mt-1.5 block text-sm text-red-300">
                                    {form.errors.email}
                                </span>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm text-white/80">Contraseña</span>
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className={field}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-signal text-sm font-semibold text-night transition-colors hover:bg-white disabled:opacity-60"
                    >
                        {form.processing ? 'Ingresando…' : 'Ingresar'}
                    </button>
                </form>
            </main>
        </>
    );
}
