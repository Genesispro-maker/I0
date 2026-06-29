import { RefObject, useEffect } from "react";

export const useClickOutside = (ref: RefObject<Element | any>, callback: () => void) => {
    useEffect(() => {
        function handleClick(e: globalThis.MouseEvent){
            if(ref.current && !ref.current.contains(e.target as Node)){
                callback()
            }
        }

        window.addEventListener("click", handleClick)

        return () => {
            window.removeEventListener("click", handleClick)
        }
    }, [ref, callback])
}