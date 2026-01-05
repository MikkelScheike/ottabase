export interface AdvancedImageData {
    url?: string;
    file?: { url: string }; // legacy @editorjs/image (file.url) support
    caption?: string;
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
    alt?: string;
    linkUrl?: string;
    width?: number;
    height?: number;
    useNextImage?: boolean;
    featuredImage?: boolean;
    aspectRatio?: string;
}

export interface UploadResponse {
    success: boolean;
    data?: {
        url: string;
        name?: string;
        width?: number;
        height?: number;
    };
    error?: string;
    message?: string;
}
