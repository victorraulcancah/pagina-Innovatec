/**
 * Texto de una publicación. Formato simple: párrafos separados por una línea
 * en blanco, "## Título" para un subtítulo y líneas que empiezan con "- " para listas.
 */
export function PostBody({ text }: { text: string }) {
    const blocks = text.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);

    return (
        <div className="space-y-6 text-base leading-[1.85] text-white/80 sm:text-lg">
            {blocks.map((block, i) => {
                const lines = block.split('\n');

                if (block.startsWith('## ')) {
                    return (
                        <h2 key={i} className="pt-4 font-display text-xl uppercase leading-snug text-white">
                            {block.slice(3)}
                        </h2>
                    );
                }

                if (lines.every((l) => l.startsWith('- '))) {
                    return (
                        <ul key={i} className="list-disc space-y-2 pl-6 marker:text-signal">
                            {lines.map((l, k) => (
                                <li key={k}>{l.slice(2)}</li>
                            ))}
                        </ul>
                    );
                }

                return (
                    <p key={i} className="whitespace-pre-line">
                        {block}
                    </p>
                );
            })}
        </div>
    );
}
