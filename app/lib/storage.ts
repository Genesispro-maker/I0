export const Storage = async (data: Array<string>): Promise<string[]> => {
    const project_Id = "lrfigxjdedhkdpvqkncu"
    const bucktname = "input-output"
    const key = process.env.PUBLISH_KEY!

    try {
       const upload = data.map(async (item) => {
         const blobres = await fetch(item)
         const file = await blobres.blob()

         const mime = file.type.split(';')[0] || 'image/png';
         const ext = mime.split('/')[1] || 'png';
         
         const random = crypto.randomUUID()
         const path = `projects/${random}.${ext}`;

         const res = await fetch(`https://${project_Id}.supabase.co/storage/v1/object/${bucktname}/${path}`, {
            method: "POST",
            headers: {
                'apikey': key,
                'Content-Type': mime || 'application/octet-stream'
            },
            body: file
         })

         if(!res.ok){
            const errBody = await res.text();
            throw new Error(`Upload failed ${res.status}: ${errBody || res.statusText}`)
         }

         return `https://${project_Id}.supabase.co/storage/v1/object/public/${bucktname}/${path}`;
       })

      const urls = await Promise.all(upload)
      return urls

    } catch (err){
        throw err
    }
}
