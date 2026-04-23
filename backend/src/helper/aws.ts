import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import path from "path";
import { UploadResult } from "./types";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Use PutObjectCommand (single-part PUT) instead of multipart Upload.
// Multipart uploads can fail with InvalidPart ETag mismatches on some S3
// bucket configurations. PutObjectCommand supports files up to 5 GB and
// has no part complexity.
export const uploadVideo = async (
  instructorId: string,
  courseId: string,
  folderName: string,
  videoFile: Buffer,
  filename: string,
  contentType: string = "video/mp4",
): Promise<UploadResult> => {
  try {
    const sanitizedFilename = path
      .normalize(filename)
      .replace(/^(\.\.([/\\]|$))+/, "");
    const sanitizedFolderName = path
      .normalize(folderName)
      .replace(/^(\.\.([/\\]|$))+/, "");
    const fileKey = `${instructorId}/${courseId}/${sanitizedFolderName}/${sanitizedFilename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: videoFile,
        ContentType: contentType,
        ContentDisposition: "inline", // lets browsers render PDFs/videos directly
        Metadata: {
          "instructor-id": instructorId,
          "original-filename": filename,
        },
      }),
    );

    return {
      success: true,
      videoUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      key: fileKey,
      message: "File uploaded successfully",
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(
      `Failed to upload file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

// Delete a single file from S3 by its public URL.
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.slice(1));
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};

// Batch-delete up to 1000 files from S3 in a single API call.
// Used when deleting a folder — removes all its videos/notes at once.
export const deleteMultipleFiles = async (fileUrls: string[]): Promise<void> => {
  if (!fileUrls.length) return;

  try {
    const objects = fileUrls.map((fileUrl) => {
      const url = new URL(fileUrl);
      return { Key: decodeURIComponent(url.pathname.slice(1)) };
    });

    // S3 DeleteObjects supports up to 1000 keys per request
    const chunkSize = 1000;
    for (let i = 0; i < objects.length; i += chunkSize) {
      const chunk = objects.slice(i, i + chunkSize);
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Delete: { Objects: chunk, Quiet: true },
        }),
      );
    }
  } catch (error) {
    console.error("Error batch-deleting files from S3:", error);
  }
};
