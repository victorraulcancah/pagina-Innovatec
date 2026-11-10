import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { MagusLoginCredit } from '@/components/site/magus-credit';

/** Segundo paso del login: el código de la app de autenticación o uno de respaldo. */
export default function TwoFactorChallenge() {
    const form = useForm({ code: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/login/codigo', {
            onError: () => form.setData('code', ''),
        });
    };

    return (
        <>
            <Head title="Verificación en dos pasos" />
            <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_60%_70%_at_70%_30%,#0b2f78_0%,#050b1a_70%)] px-6 py-12">
                <div className="w-full max-w-sm">
                    <form onSubmit={submit}>
                        <img
                            src="/brand/logo-light.png"
                            alt="PROINNOVATEC by Grupo CAME"
                            className="mb-10 h-10 w-auto"
                        />
                        <h1 className="font-display text-xl text-white uppercase">
                            Verificación en dos pasos
                        </h1>
                        <p className="mt-4 text-sm leading-relaxed text-white/80">
                            Escribe el código de 6 dígitos que muestra tu app de
                            autenticación.
                        </p>

                        <label className="mt-8 block">
                            <span className="mb-1.5 block text-sm text-white/80">
                                Código
                            </span>
                            <input
                                type="text"
                                autoComplete="one-time-code"
                                autoFocus
                                required
                                maxLength={32}
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                                aria-invalid={!!form.errors.code || undefined}
                                className="block w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-center text-lg tracking-[0.2em] text-white placeholder:text-white/40 focus:border-signal focus:ring-2 focus:ring-signal/30 focus:outline-none aria-[invalid=true]:border-red-400"
                            />
                            {form.errors.code && (
                                <span
                                    role="alert"
                                    className="mt-1.5 block text-sm text-red-300"
                                >
                                    {form.errors.code}
                                </span>
                            )}
                        </label>

                        <p className="mt-3 text-xs leading-relaxed text-white/70">
                            ¿No tienes el celular? Escribe aquí uno de tus
                            códigos de respaldo.
                        </p>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-signal text-sm font-semibold text-night transition-colors hover:bg-white disabled:opacity-60"
                        >
                            {form.processing ? 'Verificando…' : 'Verificar'}
                        </button>

                        <p className="mt-5 text-center">
                            <Link
                                href="/admin/login"
                                className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
                            >
                                Volver a empezar
                            </Link>
                        </p>
                    </form>
                    <MagusLoginCredit />
                </div>
            </main>
        </>
    );
}
