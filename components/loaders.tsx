"use client"
import { useEffect, useRef } from "react"

export const TVeffect = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const requestRef = useRef<number>(0)
    const lastFrameTimeRef = useRef<number>(0)

    function generateNoise() {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const w = canvas.width
        const h = canvas.height
        const intensity = 1.0

        const imageData = ctx.createImageData(w, h)
        const data = imageData.data
        const lenght = data.length

        for (let i = 0; i < lenght; i += 4) {
            const value = Math.random() < intensity ? (Math.random() * 255) | 0 : 0
            data[i] = value
            data[i + 1] = value
            data[i + 2] = value
            data[i + 3] = 255
        }

        ctx.putImageData(imageData, 0, 0)
    }

    useEffect(() => {
        const animate = (timestamp: number) => {
            const speed = 30
            
            if (lastFrameTimeRef.current === 0) {
                lastFrameTimeRef.current = timestamp
            }

            const elapsed = timestamp - lastFrameTimeRef.current
            const targetInterval = 1000 / speed

            if (elapsed > targetInterval) {
                generateNoise()
                lastFrameTimeRef.current = timestamp
            }

            requestRef.current = requestAnimationFrame(animate)
        }

        requestRef.current = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(requestRef.current)
        }
    }, [])

    return (
        <>
            <canvas ref={canvasRef} className="block w-full h-full" />
            <div className="crt fixed inset-0 pointer-events-none z-10 bg-black/10"></div>
        </>
    )
}