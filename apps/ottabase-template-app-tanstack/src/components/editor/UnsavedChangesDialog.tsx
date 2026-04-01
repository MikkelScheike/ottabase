/**
 * UnsavedChangesDialog
 *
 * Pair this with `useEditorLeaveGuard`. The dialog appears automatically
 * when TanStack Router blocks an in-app navigation because the editor
 * has unsaved changes.
 *
 * Example:
 *   const { blocker, allowNavigateRef } = useEditorLeaveGuard(isDirty);
 *   …
 *   <UnsavedChangesDialog blocker={blocker} />
 */
import type { EditorLeaveBlocker } from '@/hooks/useEditorLeaveGuard';
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

interface UnsavedChangesDialogProps {
    blocker: EditorLeaveBlocker;
}

export function UnsavedChangesDialog({ blocker }: UnsavedChangesDialogProps) {
    return (
        <AlertDialog open={blocker.status === 'blocked'}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes that will be lost if you leave this page.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={blocker.proceed}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Leave without saving
                    </AlertDialogAction>
                    <AlertDialogCancel onClick={blocker.reset}>Stay and keep editing</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
