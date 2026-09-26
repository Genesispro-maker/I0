"use client"
import { useEffect, useRef } from "react"

export const TVeffect = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const requestRef = useRef<number>(0)
    const lastframetime = useRef<number>(0)

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
            
            if (lastframetime.current === 0) {
                lastframetime.current = timestamp
            }

            const elapsed = timestamp - lastframetime.current
            const targetInterval = 1000 / speed

            if (elapsed > targetInterval) {
                generateNoise()
                lastframetime.current = timestamp
            }

            requestRef.current = requestAnimationFrame(animate)
        }

        requestRef.current = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(requestRef.current)
        }
    }, [])

    return (
        <section>
          <canvas ref={canvasRef} className="block w-full h-full" />
          <div className="crt fixed inset-0 pointer-events-none z-10 bg-black/10"></div>
        </section>
    )
}

// import { useEffect, useRef, useState } from "react"
// import { loadSandpackClient } from "@codesandbox/sandpack-client"

// export const UltraLowLevelPreview = () => {
//   const iframeRef = useRef<HTMLIFrameElement>(null)
//   const [customLoading, setCustomLoading] = useState(true)

//   useEffect(() => {
//     if (!iframeRef.current) return

//     let client: any

//     const initClient = async () => {
//       // Direct raw creation via node_modules binaries
//       client = await loadSandpackClient(iframeRef.current!, {
//         files: {
//           "/index.js": { code: `console.log("Hello Low Level World")` }
//         },
//         template: "vanilla",
//       })

//       // Hook directly into the bridge messaging layer
//       client.listen((message: any) => {
//         if (message.type === "start") {
//           setCustomLoading(true)
//         }
//         if (message.type === "done") {
//           setCustomLoading(false) // Bundler finished compilation cycle smoothly
//         }
//       })
//     }

//     initClient()

//     return () => {
//       client?.destroy() // Gracefully unmount iframe references
//     }
//   }, [])

//   return (
//     <div className="relative w-full h-full min-h-[400px]">
//       {customLoading && (
//         <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-xs font-mono">
//           [CUSTOM NODE-MODULE LOADER BUNDLING...]
//         </div>
//       )}
//       <iframe ref={iframeRef} className="w-full h-full border-0" />
//     </div>
//   )
// }
