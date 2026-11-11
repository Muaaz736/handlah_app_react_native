/**
 * ImageUploader Component Types
 */
export interface ImageAsset {
    uri: string;
    fileName?: string;
    fileSize?: number;
    type?: string;
    base64?: string;
  }