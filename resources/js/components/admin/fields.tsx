import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';

const control =
    'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-signal-deep focus:outline-none focus:ring-2 focus:ring-signal-deep/25 aria-[invalid=true]:border-red-600';

export function Field({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800">
                {label}
            </span>
            {children}
            {hint && !error && (
                <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
            )}
            {error && (
                <span role="alert" className="mt-1.5 block text-xs text-red-700">
                    {error}
                </span>
            )}
        </label>
    );
}

export function TextInput({
    invalid,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
    return <input {...props} aria-invalid={invalid || undefined} className={control} />;
}

export function TextArea({
    invalid,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
    return (
        <textarea
            {...props}
            aria-invalid={invalid || undefined}
            className={`${control} resize-y`}
        />
    );
}

export function Select({
    children,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props} className={control}>
            {children}
        </select>
    );
}

export function SmallButton({
    children,
    danger,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
    return (
        <button
            type="button"
            {...props}
            className={`inline-flex min-h-9 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                danger
                    ? 'border-red-200 text-red-700 hover:bg-red-50'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
        >
            {children}
        </button>
    );
}

export function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="grid gap-6 border-t border-slate-200 py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
            <div>
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                {description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
}
