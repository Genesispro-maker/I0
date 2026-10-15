import { inngest } from "@/app/lib/inngest/client"
import { generateUI } from "@/app/lib/inngest/functions/generate-ui"
import { serve } from "inngest/next"

export const dynamic = "force-dynamic";
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [generateUI],
    streaming: true,
    servePath: "/api/inngest",
    serveOrigin: process.env.NEXT_PUBLIC_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}?x-vercel-protection-bypass=${process.env.PROTECTION_BYPASS_KEY}` : undefined),
})