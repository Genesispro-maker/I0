import { Tabs } from "@base-ui/react";
import { SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { ErrorReader } from "../fix";
import { RefObject, useEffect } from "react";

export function Preview({ files, id, filesRef }: { files: Record<string, string>, id: string | undefined, filesRef: RefObject<Array<string>>, }){
    return (
     <SandpackProvider style={{height: "100%"}} template="react-ts" files={files} customSetup={{
           dependencies: {
             "lucide-react": "latest",
             "react-router-dom": "latest",
             "react-query": "latest",
           }
         }} options={{
           activeFile: "/App.tsx",
           visibleFiles: Object.keys(files) as string[],
           externalResources: ["https://cdn.tailwindcss.com"],
         }} theme="dark" key={Object.keys(files).sort().join(',')}>
         <SandpackLayout className="relative" style={{ height: "100%" }}>
           <Tabs.Panel keepMounted value="preview" className="w-full">
              <ErrorReader messageId={id} />
              <SandpackPreview showNavigator={true} showRefreshButton={false} showOpenInCodeSandbox={false} style={{ height: "100%" }} />
           </Tabs.Panel>
     
           <Tabs.Panel keepMounted value="editor" className="w-full flex overflow-y-auto">
             <SandpackFileExplorer style={{ height: "100%" }}/>
             <SandpackCodeEditor showTabs={false} style={{ height: "100%" }} />
             <Bridge filesRef={filesRef} />
           </Tabs.Panel>
         </SandpackLayout>
     </SandpackProvider>
    )
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