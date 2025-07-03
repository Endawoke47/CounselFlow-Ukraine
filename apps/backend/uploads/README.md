# Uploads Module

This module provides a flexible file upload system with support for multiple
storage strategies.

## Features

- Abstract storage strategy interface
- Local file system storage implementation
- AWS S3 storage implementation
- Configurable file upload options (file types, size limits, etc.)
- Easy-to-use decorators for controllers
- Support for custom S3 buckets per module/service

## Configuration

Set the following environment variables in your `.env` file:

```
# Storage configuration
UPLOADS_STORAGE_PROVIDER=s3 # 'local' or 's3'

# AWS S3 configuration (required if UPLOADS_STORAGE_PROVIDER=s3)
UPLOADS_AWS_REGION=us-east-1
UPLOADS_AWS_ACCESS_KEY_ID=your_access_key_id
UPLOADS_AWS_SECRET_ACCESS_KEY=your_secret_access_key
UPLOADS_AWS_S3_DEFAULT_BUCKET_NAME=your-default-bucket-name
```

## Module Capabilities

### Storage Strategies

- **S3 Storage (Default)**: Files are stored in an AWS S3 bucket
- **Local Storage**: Files are stored on the local file system in the
  `./uploads` directory

### Decorators

- **FileUpload**: File upload decorator with configurable options (file types,
  size limits, destination, etc.)

### Service Methods

- **uploadFile**: Upload a file using the configured storage strategy
- **deleteFile**: Delete a file from storage
- **getFileUrl**: Get the URL for a file

### Custom S3 Buckets

The module supports specifying different S3 buckets for different types of
uploads. Each consuming module can specify its own bucket name when uploading
files.

## Integration

To use this module in your application:

1. Import the `UploadsModule` in your module
2. Inject the `UploadsService` in your service or controller
3. Use the provided decorators and service methods to handle file uploads

## Extending

To add a new storage strategy:

1. Implement the `StorageStrategy` interface
2. Register your strategy in the `UploadsModule`
3. Update the `UploadsService` to use your strategy based on configuration
