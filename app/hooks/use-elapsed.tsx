import { useEffect, useState } from "react";

export function useElapsed(running: boolean){
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        if(!running) return
        const id = setInterval(() => setSeconds((n) => n + 1), 1000)

        return () => clearInterval(id)
    }, [running])

    return seconds;
}