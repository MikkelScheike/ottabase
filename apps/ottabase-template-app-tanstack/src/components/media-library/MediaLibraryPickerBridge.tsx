import { MediaLibraryBrowser } from '@/components/media-library/MediaLibraryBrowser';
import type { MediaKind } from '@ottabase/medialibrary';
import { Dialog, DialogContent } from '@ottabase/ui-shadcn';
import { useEffect, useState } from 'react';

interface MediaLibraryOpenDetail {
    acceptKinds?: MediaKind[];
    source?: string;
}

export function MediaLibraryPickerBridge() {
    const [isOpen, setIsOpen] = useState(false);
    const [acceptKinds, setAcceptKinds] = useState<MediaKind[] | undefined>(undefined);

    useEffect(() => {
        const handleOpen = (event: Event) => {
            const detail = (event as CustomEvent<MediaLibraryOpenDetail>).detail;
            setAcceptKinds(detail?.acceptKinds);
            setIsOpen(true);
        };

        window.addEventListener('media-library-open', handleOpen as EventListener);
        return () => {
            window.removeEventListener('media-library-open', handleOpen as EventListener);
        };
    }, []);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(nextOpen) => {
                setIsOpen(nextOpen);
                if (!nextOpen) {
                    setAcceptKinds(undefined);
                }
            }}
        >
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <MediaLibraryBrowser
                    title="Media picker"
                    description="Search your uploads, inspect metadata, and insert the selected file into the editor."
                    emptyTitle="No matching media yet"
                    emptyDescription="Upload a file here to add it to the library and use it immediately."
                    acceptKinds={acceptKinds}
                    mode="picker"
                    onSelectItem={(payload) => {
                        window.dispatchEvent(
                            new CustomEvent('media-library-selected-item', {
                                detail: {
                                    media: payload,
                                    openedVia: 'programmatic',
                                },
                            }),
                        );
                        setIsOpen(false);
                        setAcceptKinds(undefined);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
