import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { configService, Env } from 'src/services/config.service';

export interface FileUploadOptions {
  /**
   * Destination directory for uploaded files (relative to ./uploads)
   * @default ''
   */
  destination?: string;

  /**
   * Allowed file types (extensions without the dot)
   * @default ['jpg', 'jpeg', 'png', 'gif', 'pdf']
   */
  fileTypes?: string[];

  /**
   * Maximum file size in bytes
   * @default 5242880 (5MB)
   */
  maxSize?: number;

  /**
   * Field name in the form data
   * @default 'file'
   */
  fieldName?: string;

  /**
   * Storage provider to use
   * @default from UPLOADS_STORAGE_PROVIDER env or 's3'
   */
  storageProvider?: 'local' | 's3';
}

@Injectable()
export class FileUploadInterceptor {
  /**
   * Creates a file interceptor with the specified options
   * @param options Upload options
   * @returns FileInterceptor with the specified options
   */
  static intercept(options: FileUploadOptions = {}) {
    const {
      destination = '',
      fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
      maxSize = 5 * 1024 * 1024, // 5MB
      fieldName = 'file',
      storageProvider = configService.get(Env.UPLOADS_STORAGE_PROVIDER) || 's3',
    } = options;

    // Create regex pattern from file types
    const fileTypePattern = new RegExp(`\\.(${fileTypes.join('|')})$`);

    let storageConfig: any;

    if (storageProvider === 'local') {
      // For local storage, use disk storage
      const uploadPath = destination
        ? join('./uploads', destination)
        : './uploads';

      storageConfig = diskStorage({
        destination: uploadPath,
        filename: (req, file, callback) => {
          const fileBuffer = Buffer.from(
            file.originalname + Date.now().toString(),
          );
          const hash = crypto
            .createHash('md5')
            .update(fileBuffer)
            .digest('hex');
          const ext = extname(file.originalname);
          const filename = `${hash}${ext}`;
          callback(null, filename);
        },
      });
    } else {
      // For S3 storage, use memory storage
      storageConfig = memoryStorage();
    }

    return FileInterceptor(fieldName, {
      storage: storageConfig,
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(fileTypePattern)) {
          return callback(
            new Error(`Only ${fileTypes.join(', ')} files are allowed!`),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: maxSize,
      },
    });
  }
}
