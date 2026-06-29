export default function Skeleton(){
    return (
        <main className="flex flex-col gap-3 p-4">
            <div className="flex justify-between items-center">
                <div className="h-10 w-40 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="h-10 w-30 rounded-lg bg-zinc-800 animate-pulse" />
            </div>
            <div className="w-full grid grid-cols-3 gap-3">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="rounded-lg border-zinc-700">
                      <div className="w-full h-50 bg-zinc-800 animate-pulse rounded-md" />
                       <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 my-2 animate-pulse bg-zinc-800 rounded-full"/>
                        <div className="w-70 h-8 my-2 animate-pulse bg-zinc-800 rounded-md"/>
                       </div>
                    </div>
                ))}
            </div>
        </main>
    )
}