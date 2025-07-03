import { applyDecorators, UseInterceptors } from '@nestjs/common';
import {
  FileUploadInterceptor,
  FileUploadOptions,
} from '../interceptors/file-upload.interceptor';

/**
 * Decorator for file uploads
 * @param options Upload options
 * @returns Decorator
 */
export function FileUpload(options: FileUploadOptions = {}) {
  return applyDecorators(
    UseInterceptors(FileUploadInterceptor.intercept(options)),
  );
}
