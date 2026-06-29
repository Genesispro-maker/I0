import clsx from "clsx"
import { LoaderProps } from "../types/types"

export const FileuploadIcon = (props: React.ComponentProps<"svg">) => {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M4 12L4 14.5442C4 17.7892 4 19.4117 4.88607 20.5107C5.06508 20.7327 5.26731 20.9349 5.48933 21.1139C6.58831 22 8.21082 22 11.4558 22C12.1614 22 12.5141 22 12.8372 21.886C12.9044 21.8623 12.9702 21.835 13.0345 21.8043C13.3436 21.6564 13.593 21.407 14.0919 20.9081L18.8284 16.1716C19.4065 15.5935 19.6955 15.3045 19.8478 14.9369C20 14.5694 20 14.1606 20 13.3431V10C20 6.22876 20 4.34315 18.8284 3.17157C17.6569 2 15.7712 2 12 2M13 21.5V21C13 18.1716 13 16.7574 13.8787 15.8787C14.7574 15 16.1716 15 19 15H19.5" />
    <path d="M10 5C9.41016 4.39316 7.84027 2 7 2C6.15973 2 4.58984 4.39316 4 5M7 3L7 10" />
    </svg>  
}

export const V0 = (props: React.ComponentProps<"svg">) => {
   return <svg {...props} fill="white" viewBox="0 0 147 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-10">
          <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
          <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z">
          </path>
          </svg>
}

export const Figma = (props: React.ComponentProps<"svg">) => {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <circle cx="15" cy="12" r="3" />
    <path d="M9 21C10.6569 21 12 19.6569 12 18V15H9C7.34315 15 6 16.3431 6 18C6 19.6569 7.34315 21 9 21Z" />
    <path d="M12 9V15H9C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9H12Z" strokeLinecap="round" />
    <path d="M12 3V9H9C7.34315 9 6 7.65685 6 6C6 4.34315 7.34315 3 9 3H12Z" strokeLinecap="round" />
    <path d="M12 3V9H15C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3H12Z" strokeLinecap="round" />
  </svg>
}

export const Github = ({size = 16, ...props}: {size?: number} & React.ComponentProps<"svg">) => {
  return <svg {...props} className="size-6 text-v0-gray-1000 shrink-0" height={size} strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{color: "currentColor",}}>
          <g>
           <path d="M8 0C3.58 0 0 3.57879 0 7.99729C0 11.5361 2.29 14.5251 5.47 15.5847C5.87 15.6547 6.02 15.4148 6.02 15.2049C6.02 15.0149 6.01 14.3851 6.01 13.7154C4 14.0852 3.48 13.2255 3.32 12.7757C3.23 12.5458 2.84 11.836 2.5 11.6461C2.22 11.4961 1.82 11.1262 2.49 11.1162C3.12 11.1062 3.57 11.696 3.72 11.936C4.44 13.1455 5.59 12.8057 6.05 12.5957C6.12 12.0759 6.33 11.726 6.56 11.5261C4.78 11.3262 2.92 10.6364 2.92 7.57743C2.92 6.70773 3.23 5.98797 3.74 5.42816C3.66 5.22823 3.38 4.40851 3.82 3.30888C3.82 3.30888 4.49 3.09895 6.02 4.1286C6.66 3.94866 7.34 3.85869 8.02 3.85869C8.7 3.85869 9.38 3.94866 10.02 4.1286C11.55 3.08895 12.22 3.30888 12.22 3.30888C12.66 4.40851 12.38 5.22823 12.3 5.42816C12.81 5.98797 13.12 6.69773 13.12 7.57743C13.12 10.6464 11.25 11.3262 9.47 11.5261C9.76 11.776 10.01 12.2558 10.01 13.0056C10.01 14.0752 10 14.9349 10 15.2049C10 15.4148 10.15 15.6647 10.55 15.5847C12.1381 15.0488 13.5182 14.0284 14.4958 12.6673C15.4735 11.3062 15.9996 9.67293 16 7.99729C16 3.57879 12.42 0 8 0Z" fill="currentColor"></path>
          </g>
          <defs>
           <rect width={size} height={size} fill="white"></rect>
          </defs>
         </svg>
}

export function ChevronIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M3.5 9L7.5 5L3.5 1" stroke="currentcolor" />
    </svg>
  );
}

export function BrainIcon(props: React.ComponentProps<"svg">){
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 4.49988C12 3.11917 10.8807 1.99988 9.5 1.99988C8.11929 1.99988 7 3.11917 7 4.49988C5.34315 4.49988 4 5.84303 4 7.49988C4 8.06854 4.15822 8.60025 4.43304 9.05338C3.04727 9.31843 2 10.5369 2 11.9999C2 13.4629 3.04727 14.6813 4.43304 14.9464C4.15822 15.3995 4 15.9312 4 16.4999C4 18.1568 5.34315 19.4999 7 19.4999C7 20.8806 8.11929 21.9999 9.5 21.9999C10.8807 21.9999 12 20.8806 12 19.4999" stroke-linejoin="round" />
    <path d="M12 19.4999C12 20.8806 13.1193 21.9999 14.5 21.9999C15.8807 21.9999 17 20.8806 17 19.4999C18.6569 19.4999 20 18.1568 20 16.4999C20 15.9312 19.8418 15.3995 19.567 14.9464C20.9527 14.6813 22 13.4629 22 11.9999C22 10.5369 20.9527 9.31843 19.567 9.05338C19.8418 8.60025 20 8.06854 20 7.49988C20 5.84303 18.6569 4.49988 17 4.49988C17 3.11917 15.8807 1.99988 14.5 1.99988C13.1193 1.99988 12 3.11917 12 4.49988" stroke-linejoin="round" />
    <path d="M10.487 7.00085V8.97987M7 10.5012H9.05198M15.0231 10.5012H17.075M15.0231 13.4745H17.075M7 13.4745H9.05198M10.487 15.0201V16.9991M13.5125 15.0201V16.9991M13.5017 7.00085V8.97987M10.052 14.9684H14.0231C14.5753 14.9684 15.0231 14.5207 15.0231 13.9684V9.97987C15.0231 9.42759 14.5753 8.97987 14.0231 8.97987H10.052C9.49969 8.97987 9.05198 9.42759 9.05198 9.97987V13.9684C9.05198 14.5207 9.49969 14.9684 10.052 14.9684Z" />
   </svg>
}

export const Loader: React.FC<LoaderProps> = ({ size = 16, color = "gray" }) => {
  const bars = Array(12).fill(0);
  return (
    <div className={clsx("loader-spinner", `w-${size} h-${size}`)}>
      {bars.map((_, i) => (
        <div key={i} className="loader-bar" style={{ backgroundColor: color, animationDelay: `${-1.2 + i * 0.1}s` }} />
      ))}
    </div>
  );
};

export function Getfiletype(files: File["type"]){
     switch(files){
        case "image/png":
          return "image"
          case "video/mp4":
            return "video"
            default: 
            return "invalid file type"
     }
  }
  
export const id = crypto.randomUUID()

export function strip(text: string): string {
  return text.replace(/```[a-z]*\n?/gi, "");
}

export function parseFiles(raw: string): Record<string, string> {
  if (!raw || typeof raw !== "string") return {}
  const clean = raw
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, "")
    .replace(/<suggestions>[\s\S]*?<\/suggestions>/g, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");

  if (start === -1 || end === -1) {
    console.error(clean.slice(0, 200));
    return {};
  }

  try {
    const jsonStr = escapedLines(clean.slice(start, end + 1)); 
    const parsed = JSON.parse(jsonStr) as Record<string, string>;

    const normalized: Record<string, string> = {};
    for (const [path, content] of Object.entries(parsed)) {
      if (!content || typeof content !== "string") {
        console.error(`Empty content for ${path}`);
        continue;
      }
      const key = path.replace(/^_\//, "/").replace(/^([^/])/, "/$1");
      if (key !== path) console.warn(`Normalized path: ${path} → ${key}`);
      normalized[key] = content;
    }

    return normalized;
  } catch (error) {
    console.error("JSON parse failed:", error);
    console.error("Raw JSON string:", clean.slice(start, Math.min(start + 500, clean.length)));
    return {};
  }
}

function escapedLines(str: string): string {
  let result = ""
  let string = false
  let escaped = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (escaped){
      result += char;
      escaped = false;
      continue
    }

    if(char === "\\"){
      escaped = true;
      result += char;
      continue
    }

    if(char === '"') {
      string = !string;
      result += char;
      continue
    }

    if (string) {
      if(char === "\n"){
        result += "\\n";
        continue
      }

      if(char === "\r"){
        result += "\\r";
        continue
      }

      if(char === "\t"){
        result += "\\t";
        continue
      }
    }

    result += char
  }

  return result
}