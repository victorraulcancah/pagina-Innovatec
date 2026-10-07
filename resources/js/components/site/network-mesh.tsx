import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DISTANCE = 150;
const POINTER_RADIUS = 190;

/**
 * Respaldo del hero cuando todavía no hay video: una malla de nodos en
 * movimiento lento que se curva hacia el puntero. Se dibuja con canvas 2D.
 */
export function NetworkMesh({ animate = true }: { animate?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) {
            return;
        }

        let width = 0;
        let height = 0;
        let nodes: Node[] = [];
        let frame = 0;
        let running = false;
        const pointer = { x: -9999, y: -9999 };

        const populate = () => {
            const count = Math.min(
                120,
                Math.max(36, Math.round((width * height) / 11000)),
            );

            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                r: 0.8 + Math.random() * 1.6,
            }));
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            populate();
            draw();
        };

        const step = () => {
            for (const n of nodes) {
                const dx = n.x - pointer.x;
                const dy = n.y - pointer.y;
                const d = Math.hypot(dx, dy);

                if (d < POINTER_RADIUS && d > 0.1) {
                    const pull = (1 - d / POINTER_RADIUS) * 0.05;
                    n.vx -= (dx / d) * pull;
                    n.vy -= (dy / d) * pull;
                }

                n.vx *= 0.995;
                n.vy *= 0.995;
                n.x += n.vx;
                n.y += n.vy;

                if (n.x < -20) n.x = width + 20;
                if (n.x > width + 20) n.x = -20;
                if (n.y < -20) n.y = height + 20;
                if (n.y > height + 20) n.y = -20;
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];

                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);

                    if (d < LINK_DISTANCE) {
                        ctx.strokeStyle = `rgba(6, 194, 240, ${(1 - d / LINK_DISTANCE) * 0.42})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }

                const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);

                if (pd < POINTER_RADIUS) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - pd / POINTER_RADIUS) * 0.5})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.stroke();
                }
            }

            for (const n of nodes) {
                ctx.fillStyle = 'rgba(190, 240, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => {
            step();
            draw();
            frame = requestAnimationFrame(loop);
        };

        const start = () => {
            if (!running && animate) {
                running = true;
                frame = requestAnimationFrame(loop);
            }
        };

        const stop = () => {
            running = false;
            cancelAnimationFrame(frame);
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
        };

        const onLeave = () => {
            pointer.x = pointer.y = -9999;
        };

        const observer = new IntersectionObserver(([entry]) =>
            entry.isIntersecting ? start() : stop(),
        );

        resize();
        // Sin animación: se deja avanzar la malla unos pasos y queda quieta.
        if (!animate) {
            for (let i = 0; i < 120; i++) step();
            draw();
        }

        observer.observe(canvas);
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove);
        document.addEventListener('pointerleave', onLeave);

        return () => {
            stop();
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
        };
    }, [animate]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full"
        />
    );
}
