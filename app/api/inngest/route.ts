import { inngest } from "@/app/lib/inngest/client"
import { generateUI } from "@/app/lib/inngest/functions/generate-ui"
import { serve } from "inngest/next"

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [generateUI]
})