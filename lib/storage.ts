import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const S3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "https://f6d8fa8b9a9c6abca80b81a31d8c711c.eu.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "rad";

// Helper to convert base64 to buffer and upload
export async function uploadImageToR2(
    base64Data: string,
    folder: string = "uploads"
): Promise<string> {
    try {
        // Remove header if present (e.g., "data:image/png;base64,")
        const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Content, "base64");

        // Generate unique filename
        const filename = `${folder}/${uuidv4()}.png`;

        await S3.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: filename,
                Body: buffer,
                ContentType: "image/png",
            })
        );

        return filename;
    } catch (error) {
        console.error("Error uploading to R2:", error);
        throw new Error("Failed to upload image");
    }
}

export async function getR2Url(key: string) {
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    if (publicDomain) {
        return `${publicDomain}/${key}`;
    }
    return key;
}
