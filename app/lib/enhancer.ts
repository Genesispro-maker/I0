"use server"

export const enhance = async (prompt: string) : Promise<{text: string, status: "success" | "error"}>  => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "nex-agi/nex-n2-pro:free",
          messages: [
            {
              role: "system",
              content: `You are an expert prompt engineer. 
                        Your task is to take a user's rough prompt and rewrite it to be clear, detailed, and highly effective for an AI model. 
                        Output ONLY the enhanced prompt, no extra text.`
            },

            {
              role: "user",
              content: prompt,
            },
          ]
        })
      })

      const data = await res.json()
      const content = data.choices[0].message.content

      return {
         status: "success",
         text: content
      }

    }catch(err){
      return {
        status: "error",
        text: "Something went wrong"
      }
    }
  }