import { MediaPreview } from '@ottabase/medialibrary';
import { RenderFn } from 'editorjs-blocks-react-renderer';

export interface MediaEmbedData {
    url: string;
    title?: string;
    caption?: string;
    mediaId?: string;
    mimeType?: string;
    mediaKind?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
}

/**
 * Renderer for non-image media blocks (video, audio, PDF, document, archive).
 * Delegates presentation to MediaPreview which already handles all media kinds.
 */
const MediaEmbed: RenderFn<MediaEmbedData> = ({ data, className = '' }) => {
    if (!data?.url) {
        return <></>;
    }

    const { url, title, caption, mediaId, mimeType, mediaKind, thumbnailUrl, previewUrl } = data;

    const item = {
        id: mediaId || url,
        url,
        previewUrl: previewUrl || url,
        thumbnailUrl: thumbnailUrl || url,
        title: title || null,
        originalName: title || url.substring(url.lastIndexOf('/') + 1),
        altText: title || null,
        caption: caption || null,
        mimeType: mimeType || null,
        mediaKind: (mediaKind || 'other') as 'video' | 'audio' | 'document' | 'archive' | 'other',
    };

    return (
        <figure className={`${className} my-6 overflow-hidden rounded-xl border border-border`}>
            <div className="min-h-[12rem]">
                {/* detail mode adds its own border+rounding; suppress to avoid double border */}
                <MediaPreview item={item} mode="detail" className="!border-0 !rounded-none" fit="contain" controls />
            </div>
            {caption && (
                <figcaption className="border-t border-border px-4 py-2 text-sm italic text-center text-muted-foreground">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};

export default MediaEmbed;
