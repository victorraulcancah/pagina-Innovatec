import { useForm } from '@inertiajs/react';
import { Fragment, useState, type FormEvent, type ReactNode } from 'react';
import type { LegalDoc } from '@/types';
import { LegalModal } from './legal-links';

const input =
    'block w-full rounded-lg border border-white/25 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-red-400';

/** Las mismas opciones que el campo «Interés» del formulario de Zoho CRM (ZohoCrm::INTERESTS). */
const interests = ['Networking', 'Ciberseguridad', 'Outsourcing TIC', 'Wi-Fi gestionado', 'Telcos', 'Otros'];

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm text-white">{label}</span>
            {children}
            {error && (
                <span role="alert" className="mt-1.5 block text-sm text-red-300">
                    {error}
                </span>
            )}
        </label>
    );
}

/** «A», «A y B», «A, B y C». */
const joiner = (i: number, total: number) => (i === 0 ? '' : i === total - 1 ? ' y ' : ', ');

/**
 * Formulario de la página Contacto: guarda el mensaje y avisa por correo. Si hay documentos legales (Términos y
 * Condiciones, Política de Privacidad…), pide aceptarlos; cada nombre abre su documento.
 */
export function ContactForm({ legalDocs }: { legalDocs: LegalDoc[] }) {
    const form = useForm({ name: '', email: '', phone: '', company: '', interest: '', message: '', terms: false, company_site: '' });
    const [sent, setSent] = useState(false);
    const [doc, setDoc] = useState<LegalDoc | null>(null);

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
                <p className="mt-3 text-base leading-relaxed text-white">
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
            <Field label="Interés *" error={form.errors.interest}>
                <select
                    className={`${input} [&>option]:bg-night [&>option]:text-white`}
                    value={form.data.interest}
                    required
                    aria-invalid={!!form.errors.interest || undefined}
                    onChange={(e) => form.setData('interest', e.target.value)}
                >
                    <option value="" disabled>
                        Elige una opción
                    </option>
                    {interests.map((interest) => (
                        <option key={interest} value={interest}>
                            {interest}
                        </option>
                    ))}
                </select>
            </Field>
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

            {legalDocs.length > 0 && (
                <div>
                    <div className="flex items-start gap-3">
                        <input
                            id="contact-terms"
                            type="checkbox"
                            checked={form.data.terms}
                            required
                            aria-invalid={!!form.errors.terms || undefined}
                            onChange={(e) => form.setData('terms', e.target.checked)}
                            className="mt-1 size-4 shrink-0 cursor-pointer accent-signal"
                        />
                        <p className="text-sm leading-relaxed text-white">
                            <label htmlFor="contact-terms" className="cursor-pointer">
                                He leído y acepto lo indicado en{' '}
                            </label>
                            {legalDocs.map((d, i) => (
                                <Fragment key={d.id}>
                                    {joiner(i, legalDocs.length)}
                                    <button
                                        type="button"
                                        onClick={() => setDoc(d)}
                                        aria-haspopup="dialog"
                                        className="cursor-pointer text-signal underline underline-offset-4 hover:text-white"
                                    >
                                        {d.title}
                                    </button>
                                </Fragment>
                            ))}
                            {' *'}
                        </p>
                    </div>
                    {form.errors.terms && (
                        <span role="alert" className="mt-1.5 block text-sm text-red-300">
                            {form.errors.terms}
                        </span>
                    )}
                    {doc && <LegalModal doc={doc} onClose={() => setDoc(null)} />}
                </div>
            )}

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
