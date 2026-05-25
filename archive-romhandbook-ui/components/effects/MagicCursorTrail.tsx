"use client"

import {
    useEffect,
    useRef
} from "react"

type Particle = {

    x: number

    y: number

    size: number

    life: number
}

export default function MagicCursorTrail() {

    const canvasRef =
        useRef<HTMLCanvasElement>(null)

    const particles =
        useRef<Particle[]>([])

    useEffect(() => {

        const canvas =
            canvasRef.current

        if (!canvas) return

        const ctx =
            canvas.getContext("2d")

        if (!ctx) return

        const context = ctx
        const cvs = canvas

        // =========================
        // RESIZE
        // =========================

        function resize() {

            cvs.width =
                window.innerWidth

            cvs.height =
                window.innerHeight

        }

        resize()

        window.addEventListener(
            "resize",
            resize
        )

        // =========================
        // MOUSE MOVE
        // =========================

        function handleMove(
            e: MouseEvent
        ) {

            particles.current.push({

                x:
                    e.clientX,

                y:
                    e.clientY,

                size:
                    Math.random() * 2 + 1,

                life:
                    0.15
            })

            // LIMIT
            if (
                particles.current.length > 30
            ) {

                particles.current.shift()

            }

        }

        window.addEventListener(
            "mousemove",
            handleMove
        )

        // =========================
        // ANIMATE
        // =========================

        let animationId = 0

        function animate() {

            context.clearRect(
                0,
                0,
                cvs.width,
                cvs.height
            )

            particles.current.forEach(
                (
                    particle,
                    index
                ) => {

                    particle.life -= 0.01

                    particle.size *= 0.985

                    if (
                        particle.life <= 0
                    ) {

                        particles.current.splice(
                            index,
                            1
                        )

                        return

                    }

                    // COLOR
                    const color =
                        Math.random() > 0.5

                            ? "139,92,246"

                            : "34,211,238"

                    // GLOW
                    context.beginPath()

                    context.fillStyle =
                        `rgba(${color},${particle.life})`

                    context.shadowBlur = 12

                    context.shadowColor =
                        `rgba(${color},0.4)`

                    context.arc(

                        particle.x,
                        particle.y,

                        particle.size,

                        0,
                        Math.PI * 2
                    )

                    context.fill()

                }
            )

            animationId =
                requestAnimationFrame(
                    animate
                )

        }

        animate()

        // =========================
        // CLEANUP
        // =========================

        return () => {

            window.removeEventListener(
                "mousemove",
                handleMove
            )

            window.removeEventListener(
                "resize",
                resize
            )

            cancelAnimationFrame(
                animationId
            )

        }

    }, [])

    return (

        <canvas
            ref={canvasRef}
            className="
                pointer-events-none

                fixed
                inset-0

                z-[9998]
            "
        />

    )

}