import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { configService, Env } from 'src/services/config.service';
import { StorageStrategy } from './storage-strategy.interface';

@Injectable()
export class LocalStorageStrategy implements StorageStrategy {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = configService.get(Env.APP_URL);
    this.ensureDirectoryExists('./uploads');
  }

  /**
   * Ensures that a directory exists, creating it if necessary
   * @param dirPath The directory path to check/create
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Uploads a file to local storage
   * @param file Buffer containing the file data
   * @param filename Name to save the file as
   * @param mimetype MIME type of the file (not used for local storage)
   * @param destination Optional subdirectory
   * @param options Optional strategy-specific options (not used for local storage)
   * @returns URL to the uploaded file
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    destination = '',
    options?: Record<string, any>,
  ): Promise<string> {
    const uploadPath = destination
      ? join('./uploads', destination)
      : './uploads';
    this.ensureDirectoryExists(uploadPath);

    const filePath = join(uploadPath, filename);
    writeFileSync(filePath, file);

    return this.getFileUrl(filename, destination, options);
  }

  /**
   * Deletes a file from local storage
   * @param fileUrl URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const urlObj = new URL(fileUrl);
      const filePath = `.${urlObj.pathname}`;

      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete file: ${errorMessage}`);
    }
  }

  /**
   * Gets the URL for a file in local storage
   * @param filename Name of the file
   * @param destination Optional subdirectory
   * @param options Optional strategy-specific options (not used for local storage)
   * @returns URL to the file
   */
  getFileUrl(
    filename: string,
    destination?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: Record<string, any>,
  ): string {
    if (!filename) {
      throw new NotFoundException('Filename not provided');
    }

    const pathPart = destination
      ? `/uploads/${destination}/${filename}`
      : `/uploads/${filename}`;

    return `${this.baseUrl}${pathPart}`;
  }
}
