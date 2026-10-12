/** Botón flotante de WhatsApp: aparece solo si hay un número en "Datos de la empresa". */
export function WhatsappButton({ number }: { number: string }) {
    const digits = number.replace(/\D/g, '');

    if (digits.length < 8) {
        return null;
    }

    return (
        <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105"
        >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3.500a8.500 8.500 0 00-7.300 12.800L3.500 20.500l4.300-1.100A8.500 8.500 0 1012 3.500zm4.900 11.900c-.2.600-1.200 1.100-1.700 1.200-.4.100-1 .1-1.600-.1-.4-.1-.9-.3-1.500-.6-2.600-1.100-4.300-3.800-4.400-4-.1-.2-1-1.300-1-2.500s.6-1.800.9-2c.2-.2.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 1.900c.1.200.1.400 0 .600l-.3.500-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.5.100.6-.1l.8-1c.2-.3.400-.2.600-.1l1.800.9c.3.100.5.200.5.300.1.200.1.800-.1 1.400z" />
            </svg>
        </a>
    );
}
