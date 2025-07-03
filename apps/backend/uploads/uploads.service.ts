import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { extname } from 'path';
import { configService, Env } from 'src/services/config.service';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { S3StorageStrategy } from './strategies/s3-storage.strategy';
import { StorageStrategy } from './strategies/storage-strategy.interface';

@Injectable()
export class UploadsService {
  private storageStrategy: StorageStrategy;

  constructor(
    private readonly localStorageStrategy: LocalStorageStrategy,
    private readonly s3StorageStrategy: S3StorageStrategy,
  ) {
    // Choose storage strategy based on configuration
    const storageProvider =
      configService.get(Env.UPLOADS_STORAGE_PROVIDER) || 's3';

    if (storageProvider === 'local') {
      this.storageStrategy = this.localStorageStrategy;
    } else {
      this.storageStrategy = this.s3StorageStrategy;
    }
  }

  /**
   * Uploads a file using the configured storage strategy
   * @param file The file to upload
   * @param destination Optional destination folder
   * @param options Optional strategy-specific options
   * @returns URL to the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    destination?: string,
    options?: Record<string, any>,
  ): Promise<string> {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Generate filename if not already present (for S3 storage)
    if (!file.filename) {
      const fileBuffer = Buffer.from(file.originalname + Date.now().toString());
      const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      const ext = extname(file.originalname);
      file.filename = `${hash}${ext}`;
    }

    // For S3 storage, we need to use the buffer
    // For local storage with disk storage, the file is already saved
    const fileBuffer = file.buffer || (await this.readFileFromDisk(file.path));

    return this.storageStrategy.uploadFile(
      fileBuffer,
      file.filename,
      file.mimetype,
      destination,
      options,
    );
  }

  /**
   * Reads a file from disk
   * @param filePath Path to the file
   * @returns Buffer containing the file data
   */
  private async readFileFromDisk(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read file from disk: ${errorMessage}`);
    }
  }

  /**
   * Deletes a file from storage
   * @param fileUrl URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    await this.storageStrategy.deleteFile(fileUrl);
  }

  /**
   * Gets a file URL from the storage strategy
   * @param filename Filename
   * @param destination Optional destination folder
   * @param options Optional strategy-specific options
   * @returns The file URL
   */
  getFileUrl(
    filename: string,
    destination?: string,
    options?: Record<string, any>,
  ): string {
    return this.storageStrategy.getFileUrl(filename, destination, options);
  }
}
