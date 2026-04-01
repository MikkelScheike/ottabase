import { mediaLibraryHooks } from '@/hooks/mediaLibraryHooks';
import { api, isApiError } from '@/lib/api';
import type { MediaKind, MediaLibraryItemLike } from '@ottabase/medialibrary';
import {
    MediaPreview,
    formatMediaFileSize,
    getMediaDisplayTitle,
    toMediaSelectionPayload,
} from '@ottabase/medialibrary';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Textarea,
} from '@ottabase/ui-shadcn';
import {
    IconCopy,
    IconDeviceFloppy,
    IconExternalLink,
    IconPhotoPlus,
    IconSearch,
    IconTrash,
    IconCheck,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type MediaListItem = MediaLibraryItemLike & {
    id: string;
    url: string;
    storageKey: string;
    originalName: string;
    mimeType: string;
    mediaKind: MediaKind;
    status: 'active' | 'archived';
    fileSize: number;
    provider: 'r2' | 'cloudflare-images';
};

interface MediaLibraryBrowserProps {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    defaultWhere?: Record<string, unknown>;
    acceptKinds?: MediaKind[];
    showUpload?: boolean;
    allowDelete?: boolean;
    mode?: 'page' | 'picker';
    confirmLabel?: string;
    /** Allow selecting multiple items at once. Only applies when mode='picker'. Default: false */
    allowMultiselect?: boolean;
    onSelectItem?: (item: ReturnType<typeof toMediaSelectionPayload>, rawItem: MediaListItem) => void;
    /** Called when the user confirms a multi-selection; receives payloads in selection order. */
    onSelectItems?: (items: ReturnType<typeof toMediaSelectionPayload>[]) => void;
}

interface UploadApiResponse {
    success?: boolean;
    error?: string;
    media?: {
        id?: string;
    };
}

const MEDIA_KIND_FILTERS: MediaKind[] = ['image', 'video', 'audio', 'document', 'archive', 'other'];

function formatCreatedAt(value?: string | number | Date | null): string {
    if (!value) {
        return 'Unknown';
    }

    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function MediaLibraryBrowser({
    title,
    description,
    emptyTitle,
    emptyDescription,
    defaultWhere,
    acceptKinds,
    showUpload = true,
    allowDelete = true,
    mode = 'page',
    confirmLabel = 'Use this file',
    allowMultiselect = false,
    onSelectItem,
    onSelectItems,
}: MediaLibraryBrowserProps) {
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeKind, setActiveKind] = useState<MediaKind | 'all'>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    // Multi-select: ordered list of selected IDs (preserves pick order for insertion)
    const [multiSelectedIds, setMultiSelectedIds] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<MediaListItem | null>(null);
    const [formValues, setFormValues] = useState({
        title: '',
        altText: '',
        caption: '',
    });

    const multiSelectedSet = useMemo(() => new Set(multiSelectedIds), [multiSelectedIds]);

    // Toggle an item in/out of the multi-selection set
    const toggleMultiSelect = useCallback((id: string) => {
        setMultiSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    // Debounce search input so we don't fire a request on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), 300);
        return () => clearTimeout(timer);
    }, [searchValue]);

    const whereClause = useMemo(() => {
        const clause: Record<string, unknown> = {
            status: 'active',
            ...(defaultWhere || {}),
        };
        // Push kind filter to the server when a specific tab is active
        if (activeKind !== 'all') {
            clause.mediaKind = activeKind;
        }
        return clause;
    }, [activeKind, defaultWhere]);

    const mediaListQuery = mediaLibraryHooks.useInfiniteList(
        {
            where: whereClause,
            search: debouncedSearch || undefined,
            orderBy: 'createdAt',
            orderDirection: 'desc',
        },
        36,
    );
    const updateMedia = mediaLibraryHooks.useUpdate();

    const items = useMemo(
        () => (mediaListQuery.data?.pages?.flatMap((page) => page.data) ?? []) as MediaListItem[],
        [mediaListQuery.data],
    );

    const allowedKinds = useMemo(() => acceptKinds ?? MEDIA_KIND_FILTERS, [acceptKinds]);

    // Light client-side filter only for acceptKinds (restricts kinds in picker mode)
    const filteredItems = useMemo(() => {
        if (!acceptKinds) return items;
        return items.filter((item) => acceptKinds.includes(item.mediaKind));
    }, [acceptKinds, items]);

    const selectedItem = useMemo(
        () => filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null,
        [filteredItems, selectedId],
    );

    useEffect(() => {
        if (selectedItem && selectedId !== selectedItem.id) {
            setSelectedId(selectedItem.id);
        }
    }, [selectedId, selectedItem]);

    useEffect(() => {
        setFormValues({
            title: selectedItem?.title || '',
            altText: selectedItem?.altText || '',
            caption: selectedItem?.caption || '',
        });
    }, [selectedItem?.altText, selectedItem?.caption, selectedItem?.id, selectedItem?.title]);

    const refetchItems = useCallback(async () => {
        await mediaListQuery.refetch();
    }, [mediaListQuery]);

    const handleUploadFiles = useCallback(
        async (files: FileList | File[]) => {
            const list = Array.from(files);
            if (list.length === 0) {
                return;
            }

            setIsUploading(true);
            let lastUploadedId: string | null = null;

            try {
                for (const file of list) {
                    const formData = new FormData();
                    formData.append('file', file);

                    const payload = await api<UploadApiResponse>('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    lastUploadedId = payload?.media?.id ?? lastUploadedId;
                }

                await refetchItems();
                if (lastUploadedId) {
                    setSelectedId(lastUploadedId);
                }
                toast.success(list.length === 1 ? 'Upload complete' : `${list.length} files uploaded`);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Upload failed');
            } finally {
                setIsUploading(false);
            }
        },
        [refetchItems],
    );

    const handleMetadataSave = useCallback(async () => {
        if (!selectedItem) {
            return;
        }

        try {
            await updateMedia.mutateAsync({
                id: selectedItem.id,
                data: {
                    title: formValues.title || null,
                    altText: formValues.altText || null,
                    caption: formValues.caption || null,
                },
            });
            await refetchItems();
            toast.success('Metadata updated');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update media');
        }
    }, [formValues.altText, formValues.caption, formValues.title, refetchItems, selectedItem, updateMedia]);

    const handleCopyUrl = useCallback(async (url: string) => {
        await navigator.clipboard.writeText(url);
        toast.success('Media URL copied');
    }, []);

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await api(`/api/medialibrary/${encodeURIComponent(deleteTarget.id)}/purge`, {
                method: 'DELETE',
            });
            await refetchItems();
            setDeleteTarget(null);
            if (selectedId === deleteTarget.id) {
                setSelectedId(null);
            }
            toast.success('Media deleted');
        } catch (error) {
            const message = isApiError(error)
                ? error.message
                : error instanceof Error
                  ? error.message
                  : 'Delete failed';
            toast.error(message);
        }
    }, [deleteTarget, refetchItems, selectedId]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative min-w-[16rem]">
                        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search files, titles, or captions..."
                            className="pl-9"
                        />
                    </div>

                    {showUpload && (
                        <>
                            <input
                                ref={uploadInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                aria-label="Upload media files"
                                onChange={(event) => {
                                    if (event.target.files) {
                                        handleUploadFiles(event.target.files);
                                        event.target.value = '';
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                onClick={() => uploadInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                <IconPhotoPlus className="mr-2 h-4 w-4" />
                                {isUploading ? 'Uploading...' : 'Upload files'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={activeKind === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveKind('all')}
                >
                    All
                </Button>
                {allowedKinds.map((kind) => (
                    <Button
                        key={kind}
                        type="button"
                        variant={activeKind === kind ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveKind(kind)}
                        className="capitalize"
                    >
                        {kind}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <Card className="min-h-[32rem]">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle>Library</CardTitle>
                                <CardDescription>
                                    {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'} available
                                </CardDescription>
                            </div>
                            {mediaListQuery.isLoading && (
                                <Badge variant="secondary" className="font-normal">
                                    Refreshing
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {mediaListQuery.isLoading && filteredItems.length === 0 ? (
                            <div className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
                                Loading media library...
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 text-center">
                                <div className="rounded-full bg-muted p-4">
                                    <IconPhotoPlus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-medium text-foreground">{emptyTitle}</p>
                                    <p className="max-w-md text-sm text-muted-foreground">{emptyDescription}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Multi-select action bar — shown when at least one item is selected */}
                                {allowMultiselect && mode === 'picker' && multiSelectedIds.length > 0 && (
                                    <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
                                        <span className="text-sm text-foreground">
                                            {multiSelectedIds.length} item{multiSelectedIds.length === 1 ? '' : 's'}{' '}
                                            selected
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                // Collect payloads in the order they were selected
                                                const ordered = multiSelectedIds
                                                    .map((id) => filteredItems.find((item) => item.id === id))
                                                    .filter(Boolean) as MediaListItem[];
                                                onSelectItems?.(ordered.map(toMediaSelectionPayload));
                                            }}
                                        >
                                            Insert {multiSelectedIds.length} item
                                            {multiSelectedIds.length === 1 ? '' : 's'}
                                        </Button>
                                    </div>
                                )}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                    {filteredItems.map((item) => {
                                        const itemTitle = getMediaDisplayTitle(item);
                                        const isSelected = selectedItem?.id === item.id;
                                        const isMultiSelected = multiSelectedSet.has(item.id);

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    if (allowMultiselect && mode === 'picker') {
                                                        // In multi-select mode toggling is the primary action;
                                                        // also update the detail panel to show the last-clicked item
                                                        toggleMultiSelect(item.id);
                                                        setSelectedId(item.id);
                                                    } else {
                                                        setSelectedId(item.id);
                                                    }
                                                }}
                                                onDoubleClick={() => {
                                                    if (mode === 'picker' && !allowMultiselect && onSelectItem) {
                                                        onSelectItem(toMediaSelectionPayload(item), item);
                                                    }
                                                }}
                                                className={`relative overflow-hidden rounded-2xl border text-left transition-all ${
                                                    isMultiSelected
                                                        ? 'border-primary shadow-sm ring-2 ring-primary/20'
                                                        : isSelected
                                                          ? 'border-primary shadow-sm ring-2 ring-primary/20'
                                                          : 'border-border hover:border-primary/40 hover:bg-muted/20'
                                                }`}
                                            >
                                                {/* Checkmark badge for multi-select */}
                                                {allowMultiselect && mode === 'picker' && isMultiSelected && (
                                                    <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                                                        <IconCheck className="h-3 w-3" />
                                                    </span>
                                                )}
                                                <div className="aspect-[4/3] overflow-hidden bg-muted/30">
                                                    <MediaPreview
                                                        item={item}
                                                        className="h-full w-full rounded-none border-0"
                                                    />
                                                </div>
                                                <div className="space-y-3 p-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="secondary" className="capitalize">
                                                            {item.mediaKind}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {formatMediaFileSize(item.fileSize)}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {itemTitle}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {item.originalName}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCreatedAt(item.createdAt)}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {mediaListQuery.hasNextPage && (
                                    <div className="mt-6 flex justify-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => mediaListQuery.fetchNextPage()}
                                            disabled={mediaListQuery.isFetchingNextPage}
                                        >
                                            {mediaListQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="h-fit xl:sticky xl:top-6">
                    <CardHeader>
                        <CardTitle>{mode === 'picker' ? 'Selected asset' : 'File details'}</CardTitle>
                        <CardDescription>
                            {selectedItem ? 'Inspect and manage the selected file.' : 'Select a file to inspect it.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {selectedItem ? (
                            <>
                                <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
                                    <div className="aspect-[4/3]">
                                        <MediaPreview item={selectedItem} mode="detail" fit="contain" />
                                    </div>
                                </div>

                                <div className="grid gap-3 text-sm">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                            File name
                                        </p>
                                        <p className="mt-1 break-all text-foreground">{selectedItem.originalName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                            Storage
                                        </p>
                                        <p className="mt-1 break-all text-foreground">{selectedItem.storageKey}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                Type
                                            </p>
                                            <p className="mt-1 text-foreground">{selectedItem.mimeType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                Provider
                                            </p>
                                            <p className="mt-1 text-foreground">{selectedItem.provider}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                Size
                                            </p>
                                            <p className="mt-1 text-foreground">
                                                {formatMediaFileSize(selectedItem.fileSize)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                Uploaded
                                            </p>
                                            <p className="mt-1 text-foreground">
                                                {formatCreatedAt(selectedItem.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {mode === 'page' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Title</label>
                                            <Input
                                                value={formValues.title}
                                                onChange={(event) =>
                                                    setFormValues((currentValues) => ({
                                                        ...currentValues,
                                                        title: event.target.value,
                                                    }))
                                                }
                                                placeholder="Homepage hero image"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Alt text</label>
                                            <Textarea
                                                value={formValues.altText}
                                                onChange={(event) =>
                                                    setFormValues((currentValues) => ({
                                                        ...currentValues,
                                                        altText: event.target.value,
                                                    }))
                                                }
                                                placeholder="Describe this media for accessibility"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Caption</label>
                                            <Textarea
                                                value={formValues.caption}
                                                onChange={(event) =>
                                                    setFormValues((currentValues) => ({
                                                        ...currentValues,
                                                        caption: event.target.value,
                                                    }))
                                                }
                                                placeholder="Optional caption shown below the media"
                                                rows={3}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            className="w-full"
                                            onClick={handleMetadataSave}
                                            disabled={updateMedia.isPending}
                                        >
                                            <IconDeviceFloppy className="mr-2 h-4 w-4" />
                                            {updateMedia.isPending ? 'Saving...' : 'Save metadata'}
                                        </Button>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <Button
                                        type="button"
                                        variant={mode === 'picker' ? 'default' : 'outline'}
                                        className="w-full"
                                        onClick={() => {
                                            if (mode === 'picker' && onSelectItem) {
                                                onSelectItem(toMediaSelectionPayload(selectedItem), selectedItem);
                                            } else {
                                                window.open(selectedItem.url, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                    >
                                        {mode === 'picker' ? (
                                            confirmLabel
                                        ) : (
                                            <>
                                                <IconExternalLink className="mr-2 h-4 w-4" />
                                                Open file
                                            </>
                                        )}
                                    </Button>

                                    {mode === 'page' && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => handleCopyUrl(selectedItem.url)}
                                            >
                                                <IconCopy className="mr-2 h-4 w-4" />
                                                Copy URL
                                            </Button>

                                            {allowDelete && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={() => setDeleteTarget(selectedItem)}
                                                >
                                                    <IconTrash className="mr-2 h-4 w-4" />
                                                    Delete permanently
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                Select a file from the library to view its preview and metadata.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this media item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the file from storage and the media library. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
