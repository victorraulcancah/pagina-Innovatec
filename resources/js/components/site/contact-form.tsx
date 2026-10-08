import { useForm } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';

const input =
    'block w-full rounded-lg border border-white/25 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-red-400';

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm text-white/80">{label}</span>
            {children}
            {error && (
                <span role="alert" className="mt-1.5 block text-sm text-red-300">
                    {error}
                </span>
            )}
        </label>
    );
}

/** Formulario de la página Contacto: guarda el mensaje y avisa por correo. */
export function ContactForm() {
    const form = useForm({ name: '', email: '', phone: '', company: '', message: '', company_site: '' });
    const [sent, setSent] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/contacto', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setSent(true);
            },
        });
    };

    if (sent) {
        return (
            <div role="status" className="border border-signal/40 bg-signal/10 p-8">
                <h2 className="font-display text-lg uppercase text-white">Mensaje enviado</h2>
                <p className="mt-3 text-base leading-relaxed text-white/80">
                    Gracias por escribirnos. Un especialista de PROINNOVATEC te responderá lo antes posible.
                </p>
                <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 text-sm text-signal underline underline-offset-4"
                >
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre *" error={form.errors.name}>
                    <input className={input} value={form.data.name} autoComplete="name" required aria-invalid={!!form.errors.name || undefined} onChange={(e) => form.setData('name', e.target.value)} />
                </Field>
                <Field label="Correo *" error={form.errors.email}>
                    <input type="email" className={input} value={form.data.email} autoComplete="email" required aria-invalid={!!form.errors.email || undefined} onChange={(e) => form.setData('email', e.target.value)} />
                </Field>
                <Field label="Teléfono" error={form.errors.phone}>
                    <input type="tel" className={input} value={form.data.phone} autoComplete="tel" onChange={(e) => form.setData('phone', e.target.value)} />
                </Field>
                <Field label="Empresa" error={form.errors.company}>
                    <input className={input} value={form.data.company} autoComplete="organization" onChange={(e) => form.setData('company', e.target.value)} />
                </Field>
            </div>
            <Field label="¿En qué podemos ayudarte? *" error={form.errors.message}>
                <textarea
                    className={`${input} resize-y`}
                    rows={5}
                    required
                    maxLength={3000}
                    value={form.data.message}
                    aria-invalid={!!form.errors.message || undefined}
                    onChange={(e) => form.setData('message', e.target.value)}
                />
            </Field>

            {/* Campo trampa: oculto para personas, los robots suelen llenarlo. */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                    No llenar este campo
                    <input tabIndex={-1} autoComplete="off" value={form.data.company_site} onChange={(e) => form.setData('company_site', e.target.value)} />
                </label>
            </div>

            <button
                type="submit"
                disabled={form.processing}
                className="inline-flex min-h-12 items-center rounded-full border border-signal bg-signal px-8 text-sm font-semibold text-night transition-colors hover:border-white hover:bg-white disabled:opacity-60"
            >
                {form.processing ? 'Enviando…' : 'Enviar mensaje'}
            </button>
        </form>
    );
}
