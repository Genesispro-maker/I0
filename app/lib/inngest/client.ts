import { Inngest } from "inngest"

export const inngest = new Inngest({
    id: "I/0",
    // eventKey: process.env.INNGEST_EVENT,
    signingKey: process.env.INNGEST_DEV,
})