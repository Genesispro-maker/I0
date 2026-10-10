export default function Skeleton(){
    return (
        <main className="flex flex-col gap-3 p-4">
            <div className="w-full flex flex-col gap-3">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="rounded-lg border-zinc-700">
                        <div className="w-full">
                            <div className="w-full h-8 rounded-md animate-pulse bg-zinc-500" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}