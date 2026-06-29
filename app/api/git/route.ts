import { Git } from "@/app/lib/github"

export async function POST(req: Request) {
  try {
    const git = new Git({
      apiKey: process.env.GITHUB!
    })
    const body = await req.json()
    const res = await git.origin(body)
    return Response.json(res)
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Failed" }, {
        status: 500
    })
  }
}