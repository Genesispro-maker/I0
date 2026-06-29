"use server"

export async function getFigmaFile(key: string) {
  try {
    const res = await fetch(`https://api.figma.com/v1/files/${key}`, {
      headers: {
        "X-Figma-Token": process.env.FIGMA_TOKEN!
      }
    })
    const data = await res.json()
    return {
        success: true,
        data
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error"
    }
  }
}