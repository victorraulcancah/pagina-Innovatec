import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/admin-layout';
import { SmallButton } from '@/components/admin/fields';
import { Modal } from '@/components/admin/modal';

type Message = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    message: string;
    read: boolean;
    date: string;
};

export default function Messages({ pages, messages }: { pages: AdminPage[]; messages: Message[] }) {
    const [open, setOpen] = useState<Message | null>(null);

    const show = (m: Message) => {
        setOpen(m);

        if (!m.read) {
            router.post(`/admin/mensajes/${m.id}/leida`, {}, { preserveScroll: true, preserveState: true });
        }
    };

    const remove = (m: Message) => {
        if (window.confirm(`¿Eliminar el mensaje de ${m.name}? Esta acción no se puede deshacer.`)) {
            router.delete(`/admin/mensajes/${m.id}`, { preserveScroll: true, onSuccess: () => setOpen(null) });
        }
    };

    return (
        <>
            <Head title="Mensajes" />
            <AdminLayout pages={pages} current="mensajes">
                <div className="mx-auto max-w-5xl px-6 pb-16 pt-10">
                    <h1 className="text-2xl font-semibold tracking-tight">Mensajes</h1>
                    <p className="mt-2 max-w-prose text-sm text-slate-600">
                        Consultas enviadas desde el formulario de la página Contacto. También llegan por correo a la dirección configurada.
                    </p>

                    {messages.length === 0 ? (
                        <p className="mt-10 rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
                            Todavía no hay mensajes.
                        </p>
                    ) : (
                        <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                            {messages.map((m) => (
                                <li key={m.id}>
                                    <button
                                        type="button"
                                        onClick={() => show(m)}
                                        className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50"
                                    >
                                        <span
                                            className={`mt-1.5 size-2.5 shrink-0 rounded-full ${m.read ? 'bg-slate-300' : 'bg-signal-deep'}`}
                                            aria-label={m.read ? 'Leído' : 'Sin leer'}
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                                                <span className={`truncate text-sm ${m.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                                                    {m.name}
                                                    {m.company ? ` · ${m.company}` : ''}
                                                </span>
                                                <span className="text-xs text-slate-500">{m.date}</span>
                                            </span>
                                            <span className="mt-1 block truncate text-sm text-slate-500">{m.message}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Modal
                    open={open !== null}
                    title={open ? `Mensaje de ${open.name}` : 'Mensaje'}
                    onClose={() => setOpen(null)}
                    footer={
                        open && (
                            <>
                                <SmallButton danger onClick={() => remove(open)}>
                                    Eliminar
                                </SmallButton>
                                <a
                                    href={`mailto:${open.email}?subject=Re: tu consulta a PROINNOVATEC`}
                                    className="inline-flex min-h-10 items-center rounded-full bg-night px-6 text-sm font-semibold text-white transition-colors hover:bg-signal-deep"
                                >
                                    Responder por correo
                                </a>
                            </>
                        )
                    }
                >
                    {open && (
                        <>
                            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-slate-500">Correo</dt>
                                    <dd><a className="underline underline-offset-2" href={`mailto:${open.email}`}>{open.email}</a></dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Teléfono</dt>
                                    <dd>{open.phone ? <a className="underline underline-offset-2" href={`tel:${open.phone}`}>{open.phone}</a> : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Empresa</dt>
                                    <dd>{open.company || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Recibido</dt>
                                    <dd>{open.date}</dd>
                                </div>
                            </dl>
                            <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">{open.message}</p>
                        </>
                    )}
                </Modal>
            </AdminLayout>
        </>
    );
}
