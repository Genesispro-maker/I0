import { Tabs } from "@base-ui/react";
import { SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { Mechanic } from "./mechanic";
import { RefObject, useEffect, useMemo } from "react";
import { Download } from "lucide-react";
import { Zip } from "@/app/util/compress";

 function Hash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function Filedownload({ className, filename }: { filename: string } & React.ComponentProps<"button">){
  const { sandpack } = useSandpack()

  const files = sandpack.files

  async function download(){
    const zip = await Zip(files)
    const url = URL.createObjectURL(zip)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return <button aria-label="Download code" className={className} type="button" onClick={download}>
           <Download size={18} />
         </button>
}

function Bridge({ filesRef }: { filesRef: RefObject<Array<string>>}){
  const { sandpack } = useSandpack()

  useEffect(() => {
    filesRef.current = Object.keys(sandpack.files)

    return () => {
      filesRef.current = []
    }
  }, [filesRef, sandpack])

  return null
}

export function Preview({ files, id, filesRef, filename }: { files: Record<string, string>, id: string | undefined, filesRef: RefObject<Array<string>>, filename: string }){
 const key = useMemo(() => Hash(JSON.stringify(files)), [files])
 
    return (
     <SandpackProvider key={key} style={{height: "100%"}} template="react-ts" files={files} customSetup={{
           dependencies: {
             "lucide-react": "latest",
             "react-router-dom": "latest",
             "react-query": "latest",
           }
         }} options={{
           activeFile: "/App.tsx",
           visibleFiles: Object.keys(files) as string[],
           externalResources: ["https://cdn.tailwindcss.com"],
         }} theme="dark">
         <SandpackLayout className="relative" style={{ height: "100%" }}>
          <Filedownload filename={filename} className="fixed text-black hover:bg-zinc-300  p-1 top-3.75 z-1000 right-22 hover:cursor-pointer rounded-lg dark:hover:bg-zinc-800 w-fit" />
           <Tabs.Panel keepMounted value="preview" className="w-full">
              <Mechanic messageId={id} />
              <SandpackPreview showNavigator={true} showRefreshButton={false} showOpenInCodeSandbox={false} style={{ height: "100%" }} />
           </Tabs.Panel>
     
           <Tabs.Panel keepMounted value="editor" className="w-full h-full min-w-0 flex min-h-0 overflow-hidden">
              <SandpackFileExplorer className="border-r flex-1 border-zinc-800 min-h-0" style={{ height: "100%" }}/>
              <div className="flex-3 min-h-0 min-w-0">
                <SandpackCodeEditor showLineNumbers className=" flex grow min-h-0" wrapContent={false} showTabs={false} style={{ height: "100%", overflowY: "auto" }} />
              </div>
            </Tabs.Panel>
           <Bridge filesRef={filesRef} />
         </SandpackLayout>
     </SandpackProvider>
    )
}