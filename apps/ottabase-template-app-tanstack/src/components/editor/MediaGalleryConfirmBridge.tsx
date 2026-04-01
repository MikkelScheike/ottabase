/**
 * MediaGalleryConfirmBridge
 *
 * Bridges the vanilla-DOM MediaGalleryTool (EditorJS) with shadcn's AlertDialog.
 * The tool fires a `media-gallery-confirm` CustomEvent instead of calling
 * window.confirm(). This React component listens, shows the dialog, then fires
 * `media-gallery-confirm-result` with { id, confirmed } so the tool can proceed.
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@ottabase/ui-shadcn';
import { useEffect, useState } from 'react';

interface ConfirmRequest {
    /** Unique id so the tool can match the response to the right pending action */
    id: string;
    message: string;
    confirmLabel?: string;
}

/** Event name the tool dispatches to request confirmation */
export const MEDIA_GALLERY_CONFIRM_EVENT = 'media-gallery-confirm';
/** Event name this bridge dispatches back with the result */
export const MEDIA_GALLERY_CONFIRM_RESULT_EVENT = 'media-gallery-confirm-result';

export function MediaGalleryConfirmBridge() {
    const [pending, setPending] = useState<ConfirmRequest | null>(null);

    useEffect(() => {
        const handleRequest = (event: Event) => {
            const detail = (event as CustomEvent<ConfirmRequest>).detail;
            if (detail?.id && detail?.message) {
                setPending(detail);
            }
        };

        window.addEventListener(MEDIA_GALLERY_CONFIRM_EVENT, handleRequest);
        return () => window.removeEventListener(MEDIA_GALLERY_CONFIRM_EVENT, handleRequest);
    }, []);

    function respond(confirmed: boolean) {
        if (!pending) return;
        window.dispatchEvent(
            new CustomEvent(MEDIA_GALLERY_CONFIRM_RESULT_EVENT, {
                detail: { id: pending.id, confirmed },
            }),
        );
        setPending(null);
    }

    return (
        <AlertDialog
            open={Boolean(pending)}
            onOpenChange={(open) => {
                if (!open) respond(false);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>{pending?.message}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => respond(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => respond(true)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {pending?.confirmLabel ?? 'Remove'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
