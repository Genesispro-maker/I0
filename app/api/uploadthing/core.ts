import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuth } from "../query/get-user";

const f = createUploadthing()

export const ourFileRouter = {
    imageUploader: f({image: {maxFileSize: "4MB", maxFileCount: 1}}).middleware(async ({ req }) => {
        const { images } = await req.json()

        const user = await getAuth()
        if(!user){
            throw new Error("unauthorized")
        }
        return {
            userId: user.id,
        }
    }).onUploadComplete(async ({metadata, file}) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.url);
        return {
            uploadedby: metadata.userId
        }
    })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter;