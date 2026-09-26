import { Inngest } from "inngest"

export const inngest = new Inngest({
    id: "I/0",
    signingKey: process.env.INNGEST_DEV,
})