import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MediaViewerItem } from '../../types';
import { MediaImmersiveLightbox } from '../MediaImmersiveLightbox';
import { MediaLightbox } from '../MediaLightbox';

const mediaItems: MediaViewerItem[] = [
    {
        id: 'item-1',
        url: 'https://example.com/image.jpg',
        originalName: 'image.jpg',
        mediaKind: 'image',
    },
];

const defaultProps = {
    items: mediaItems,
    activeIndex: 0,
    isOpen: true,
    onClose: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onSelectIndex: vi.fn(),
};

describe('Media lightbox download links', () => {
    it('uses safe new-tab fallback attributes in the default lightbox', () => {
        const { getByLabelText } = render(<MediaLightbox {...defaultProps} />);
        const downloadLink = getByLabelText('Download media');

        expect(downloadLink.getAttribute('target')).toBe('_blank');
        expect(downloadLink.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('uses safe new-tab fallback attributes in the immersive lightbox', () => {
        const { getByLabelText } = render(<MediaImmersiveLightbox {...defaultProps} />);
        const downloadLink = getByLabelText('Download');

        expect(downloadLink.getAttribute('target')).toBe('_blank');
        expect(downloadLink.getAttribute('rel')).toBe('noopener noreferrer');
    });
});
