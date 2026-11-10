import { router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Field, Section, SmallButton, TextInput } from './fields';

export type TwoFactorState = {
    enabled: boolean;
    recoveryLeft: number;
    setup: { secret: string; qr: string } | null;
    newCodes: string[] | null;
};

const primaryBtn =
    'inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-50';

/** Los códigos de respaldo recién creados: solo se pueden ver esta vez. */
function NewCodes({ codes }: { codes: string[] }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(codes.join('\n'));
        setCopied(true);
    };

    return (
        <div className="rounded-lg bg-amber-50 p-5 ring-1 ring-amber-300">
            <p className="text-sm font-semibold text-amber-950">
                Guarda estos códigos de respaldo ahora
            </p>
            <p className="mt-1 text-sm text-amber-950">
                No se volverán a mostrar. Cada uno sirve una sola vez para
                entrar si pierdes el celular. Guárdalos en un lugar seguro,
                fuera del celular.
            </p>
            <ul className="mt-4 grid gap-2 font-mono text-sm text-slate-900 sm:grid-cols-2">
                {codes.map((code) => (
                    <li
                        key={code}
                        className="rounded bg-white px-3 py-2 ring-1 ring-amber-200"
                    >
                        {code}
                    </li>
                ))}
            </ul>
            <div className="mt-4">
                <SmallButton onClick={copy}>
                    {copied ? 'Copiados' : 'Copiar códigos'}
                </SmallButton>
            </div>
        </div>
    );
}

/** Paso 1: confirmar la contraseña para generar el QR. */
function StartForm() {
    const form = useForm({ current_password: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/cuenta/mfa/iniciar', {
            preserveScroll: true,
            onFinish: () => form.reset(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Field
                label="Contraseña actual"
                error={form.errors.current_password}
            >
                <TextInput
                    type="password"
                    required
                    autoComplete="current-password"
                    value={form.data.current_password}
                    onChange={(e) =>
                        form.setData('current_password', e.target.value)
                    }
                />
            </Field>
            <button
                type="submit"
                disabled={form.processing || !form.data.current_password}
                className={primaryBtn}
            >
                Activar verificación en dos pasos
            </button>
        </form>
    );
}

/** Paso 2: escanear el QR y confirmar con el primer código de la app. */
function ConfirmForm({
    setup,
}: {
    setup: NonNullable<TwoFactorState['setup']>;
}) {
    const form = useForm({ code: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/cuenta/mfa/confirmar', {
            preserveScroll: true,
            onError: () => form.reset(),
        });
    };

    const cancel = () =>
        router.post('/admin/cuenta/mfa/cancelar', {}, { preserveScroll: true });

    return (
        <form onSubmit={submit} className="space-y-5">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                <li>
                    Instala Google Authenticator u otra app de autenticación en
                    tu celular.
                </li>
                <li>En la app, agrega una cuenta y escanea este código.</li>
                <li>Escribe abajo el código de 6 dígitos que aparece.</li>
            </ol>
            <img
                src={setup.qr}
                alt="Código QR para agregar esta cuenta a la app de autenticación"
                width={220}
                height={220}
                className="rounded-lg bg-white p-2 ring-1 ring-slate-200"
            />
            <div>
                <p className="text-sm text-slate-600">
                    ¿No puedes escanearlo? Escribe esta clave en la app:
                </p>
                <code className="mt-1 block rounded bg-slate-100 px-3 py-2 text-sm break-all text-slate-900 select-all">
                    {setup.secret.match(/.{1,4}/g)?.join(' ')}
                </code>
            </div>
            <Field label="Código de la app" error={form.errors.code}>
                <TextInput
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={form.data.code}
                    onChange={(e) => form.setData('code', e.target.value)}
                />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="submit"
                    disabled={form.processing || !form.data.code}
                    className={primaryBtn}
                >
                    Confirmar y activar
                </button>
                <SmallButton onClick={cancel}>Cancelar</SmallButton>
            </div>
        </form>
    );
}

/** Con el MFA activo: crear códigos de respaldo nuevos o desactivarlo. */
function ManageForms({ recoveryLeft }: { recoveryLeft: number }) {
    const codes = useForm({ current_password: '' });
    const disable = useForm({ current_password: '', code: '' });

    const regenerate = (e: FormEvent) => {
        e.preventDefault();
        codes.post('/admin/cuenta/mfa/codigos', {
            preserveScroll: true,
            onFinish: () => codes.reset(),
        });
    };

    const turnOff = (e: FormEvent) => {
        e.preventDefault();
        disable.post('/admin/cuenta/mfa/desactivar', {
            preserveScroll: true,
            onFinish: () => disable.reset(),
        });
    };

    return (
        <div className="space-y-8">
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
                Activa. Te quedan {recoveryLeft}{' '}
                {recoveryLeft === 1 ? 'código' : 'códigos'} de respaldo.
            </p>

            <form onSubmit={regenerate} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">
                    Crear códigos de respaldo nuevos
                </h3>
                <p className="text-sm text-slate-600">
                    Los códigos anteriores dejarán de funcionar.
                </p>
                <Field
                    label="Contraseña actual"
                    error={codes.errors.current_password}
                >
                    <TextInput
                        type="password"
                        required
                        autoComplete="current-password"
                        value={codes.data.current_password}
                        onChange={(e) =>
                            codes.setData('current_password', e.target.value)
                        }
                    />
                </Field>
                <button
                    type="submit"
                    disabled={codes.processing || !codes.data.current_password}
                    className={primaryBtn}
                >
                    Crear códigos nuevos
                </button>
            </form>

            <form
                onSubmit={turnOff}
                className="space-y-4 border-t border-slate-200 pt-8"
            >
                <h3 className="text-sm font-semibold text-slate-900">
                    Desactivar
                </h3>
                <p className="text-sm text-slate-600">
                    Tu cuenta quedará protegida solo por la contraseña.
                </p>
                <Field
                    label="Contraseña actual"
                    error={disable.errors.current_password}
                >
                    <TextInput
                        type="password"
                        required
                        autoComplete="current-password"
                        value={disable.data.current_password}
                        onChange={(e) =>
                            disable.setData('current_password', e.target.value)
                        }
                    />
                </Field>
                <Field
                    label="Código de la app o de respaldo"
                    error={disable.errors.code}
                >
                    <TextInput
                        required
                        autoComplete="one-time-code"
                        maxLength={32}
                        value={disable.data.code}
                        onChange={(e) =>
                            disable.setData('code', e.target.value)
                        }
                    />
                </Field>
                <button
                    type="submit"
                    disabled={
                        disable.processing ||
                        !disable.data.current_password ||
                        !disable.data.code
                    }
                    className="inline-flex min-h-10 items-center rounded-full border border-red-300 px-6 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                    Desactivar verificación en dos pasos
                </button>
            </form>
        </div>
    );
}

export function TwoFactorSection({ state }: { state: TwoFactorState }) {
    return (
        <Section
            title="Verificación en dos pasos"
            description="Además de la contraseña, al entrar se pide un código que genera una app en tu celular, como Google Authenticator. Es opcional y gratuita."
        >
            {state.newCodes && <NewCodes codes={state.newCodes} />}
            {state.enabled ? (
                <ManageForms recoveryLeft={state.recoveryLeft} />
            ) : state.setup ? (
                <ConfirmForm setup={state.setup} />
            ) : (
                <StartForm />
            )}
        </Section>
    );
}
