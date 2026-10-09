import { computeSha256 } from './pdf-parser';

export interface StorageUploadResult {
  storageKey: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
  presignedDownloadUrl: string;
}

const STORAGE_PREFIX = 'books/pdf-vault/';

export class PrivateStorageManager {
  private static filesMap = new Map<string, { buffer: ArrayBuffer; mimeType: string }>();

  static async uploadPdf(file: File | { name: string; buffer: ArrayBuffer; type?: string }): Promise<StorageUploadResult> {
    const originalName = file instanceof File ? file.name : file.name;
    const buffer = file instanceof File ? await file.arrayBuffer() : file.buffer;
    const mimeType = (file instanceof File ? file.type : file.type) || 'application/pdf';
    const fileSize = buffer.byteLength;
    const sha256 = await computeSha256(buffer);

    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${STORAGE_PREFIX}${Date.now()}-${safeName}`;

    this.filesMap.set(storageKey, { buffer, mimeType });

    // In production with Cloudflare R2 / S3, this would be an authenticated signed URL with a 15-minute expiration
    const presignedDownloadUrl = `/api/v1/admin/files/download?key=${encodeURIComponent(storageKey)}`;

    return {
      storageKey,
      originalName,
      fileSize,
      mimeType,
      sha256,
      presignedDownloadUrl,
    };
  }

  static getFile(storageKey: string) {
    return this.filesMap.get(storageKey);
  }
}
