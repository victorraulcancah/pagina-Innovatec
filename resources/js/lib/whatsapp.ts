const DEFAULT_MESSAGE = 'Hola, quisiera más información sobre sus servicios.';

/**
 * Enlace directo para escribir por WhatsApp (abre el chat con el mensaje ya escrito).
 * Acepta el número como se escriba en el panel: "970855741", "+51 970 855 741", etc.
 * Un celular peruano de 9 dígitos que empieza con 9 recibe el código de país 51.
 */
export function whatsappUrl(number: string | null | undefined, message: string = DEFAULT_MESSAGE): string | null {
    let digits = (number ?? '').replace(/\D/g, '');

    if (digits.length === 9 && digits.startsWith('9')) {
        digits = `51${digits}`;
    }

    if (digits.length < 8) {
        return null;
    }

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
