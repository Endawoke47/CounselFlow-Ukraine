import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, NotFoundException } from '@nestjs/common';
import { configService, Env } from 'src/services/config.service';
import { StorageStrategy } from './storage-strategy.interface';

// Options for S3 uploads
export interface S3UploadOptions {
  // Custom bucket name to use (overrides default)
  bucketName?: string;
}

@Injectable()
export class S3StorageStrategy implements StorageStrategy {
  private readonly s3Client: S3Client;
  private readonly defaultBucketName: string;
  private readonly region: string;

  constructor() {
    // Get configuration from config service
    this.region = configService.get(Env.UPLOADS_AWS_REGION);
    this.defaultBucketName = configService.get(
      Env.UPLOADS_AWS_S3_DEFAULT_BUCKET_NAME,
    );

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: configService.get(Env.UPLOADS_AWS_ACCESS_KEY_ID),
        secretAccessKey: configService.get(Env.UPLOADS_AWS_SECRET_ACCESS_KEY),
      },
    });
  }

  /**
   * Uploads a file to S3
   * @param file Buffer containing the file data
   * @param filename Name to save the file as
   * @param mimetype MIME type of the file
   * @param destination Optional subdirectory
   * @param options Optional S3-specific options
   * @returns URL to the uploaded file
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    destination = '',
    options?: S3UploadOptions,
  ): Promise<string> {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Use custom bucket if provided, otherwise use default
    const bucketName = options?.bucketName || this.defaultBucketName;
    const key = destination ? `${destination}/${filename}` : filename;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file,
          ContentType: mimetype,
        }),
      );

      return this.getFileUrl(filename, destination, options);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Failed to upload file to S3: ${errorMessage}`);
    }
  }

  /**
   * Deletes a file from S3
   * @param fileUrl URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract bucket name and key from the URL
      const urlParts = new URL(fileUrl);
      const hostParts = urlParts.host.split('.');

      // Extract bucket name from URL host (format: bucket-name.s3.region.amazonaws.com)
      const bucketName = hostParts[0];

      // Extract key from path (remove leading slash)
      const key = urlParts.pathname.substring(1);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Failed to delete file from S3: ${errorMessage}`);
    }
  }

  /**
   * Gets the URL for a file in S3
   * @param filename Name of the file
   * @param destination Optional subdirectory
   * @param options Optional S3-specific options
   * @returns URL to the file
   */
  getFileUrl(
    filename: string,
    destination?: string,
    options?: S3UploadOptions,
  ): string {
    if (!filename) {
      throw new NotFoundException('Filename not provided');
    }

    // Use custom bucket if provided, otherwise use default
    const bucketName = options?.bucketName || this.defaultBucketName;
    const key = destination ? `${destination}/${filename}` : filename;

    return `https://${bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
