 "use server"
 import { ElevenLabsClient } from "elevenlabs"
 
 export async function SST(audioblob: Blob){
    const NO11 = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    })

    const transcript = await NO11.speechToText.convert({
      file: audioblob,
      model_id: "scribe_v2",
      tag_audio_events: true,
      language_code: "eng",
      diarize: true,
    })

    return transcript
  }
  