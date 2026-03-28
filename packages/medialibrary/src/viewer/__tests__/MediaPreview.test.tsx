import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MediaPreview } from '../MediaPreview';

describe('MediaPreview immersive mode', () => {
    it('renders immersive mode without the default lightbox shell styles', () => {
        const markup = renderToStaticMarkup(
            <MediaPreview
                item={{
                    id: 'media-1',
                    url: 'https://example.com/image-1.jpg',
                    previewUrl: 'https://example.com/image-1.jpg',
                    thumbnailUrl: 'https://example.com/image-1-thumb.jpg',
                    title: 'First image',
                    originalName: 'image-1.jpg',
                    altText: 'First image alt',
                    mimeType: 'image/jpeg',
                    mediaKind: 'image',
                }}
                mode="immersive"
                fit="contain"
            />,
        );

        expect(markup).toContain('bg-transparent');
        expect(markup).not.toContain('rounded-2xl bg-black/20');
        expect(markup).toContain('object-contain');
    });
});
