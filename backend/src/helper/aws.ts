import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommandInput,
  ListObjectsV2CommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import path from "path";
import { FolderContents, FolderResult, UploadResult } from "./types";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const createFolder = async (
  instructorId: string,
  courseId: string,
  folderName: string,
): Promise<FolderResult> => {
  try {
    const sanitizedFolderName = path
      .normalize(folderName)
      .replace(/^(\.\.([/\\]|$))+/, "");
    const folderKey = `${instructorId}/${courseId}/${sanitizedFolderName}/`;

    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: folderKey,
      Body: "",
    };

    await s3Client.send(new PutObjectCommand(params));

    return {
      success: true,
      folderPath: folderKey,
      message: `Folder ${folderName} created successfully`,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error(
      `Failed to create folder: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

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

export const listFolderContents = async (
  instructorId: string,
  courseId: string,
  folderName: string = "",
): Promise<FolderContents> => {
  try {
    const sanitizedFolderName = path
      .normalize(folderName)
      .replace(/^(\.\.([/\\]|$))+/, "");
    const prefix = `${instructorId}/${courseId}/${sanitizedFolderName}`;

    const params: ListObjectsV2CommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: prefix,
      Delimiter: "/",
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));

    const folders = (data.CommonPrefixes || []).map(
      (prefix) => prefix.Prefix!.split("/").slice(-2)[0],
    );

    const files = (data.Contents || [])
      .map((item) => ({
        name: item.Key!.split("/").pop() || "",
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
      }))
      .filter((item) => item.name);

    return {
      folders,
      files,
      path: prefix,
    };
  } catch (error) {
    console.error("Error listing folder contents:", error);
    throw new Error(
      `Failed to list folder contents: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};
