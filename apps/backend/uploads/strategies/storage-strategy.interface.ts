export interface StorageStrategy {
  /**
   * Uploads a file to storage
   * @param file Buffer containing the file data
   * @param filename Name to save the file as
   * @param mimetype MIME type of the file
   * @param destination Optional subdirectory
   * @param options Optional strategy-specific options
   * @returns URL to the uploaded file
   */
  uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    destination?: string,
    options?: Record<string, any>,
  ): Promise<string>;

  /**
   * Deletes a file from storage
   * @param fileUrl URL of the file to delete
   */
  deleteFile(fileUrl: string): Promise<void>;

  /**
   * Gets the URL for a file
   * @param filename Name of the file
   * @param destination Optional subdirectory
   * @param options Optional strategy-specific options
   * @returns URL to the file
   */
  getFileUrl(
    filename: string,
    destination?: string,
    options?: Record<string, any>,
  ): string;
}
