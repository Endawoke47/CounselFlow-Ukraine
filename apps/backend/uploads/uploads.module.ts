import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { S3StorageStrategy } from './strategies/s3-storage.strategy';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({}), // Empty config as we'll use per-route configuration
    }),
  ],
  controllers: [],
  providers: [
    UploadsService,
    LocalStorageStrategy,
    S3StorageStrategy,
    FileUploadInterceptor,
  ],
  exports: [UploadsService, FileUploadInterceptor],
})
export class UploadsModule {}
