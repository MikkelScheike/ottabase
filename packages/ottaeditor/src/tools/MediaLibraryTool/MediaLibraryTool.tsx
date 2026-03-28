import './MediaLibraryTool.css';

/** Subset of the Editor.js Block API used by this tool */
interface BlocksApi {
    getCurrentBlockIndex(): number;
    getBlocksCount(): number;
    getBlockByIndex(index: number): { id: string } | undefined;
    delete(index: number): void;
    insert(
        type: string,
        data: Record<string, unknown>,
        config: Record<string, unknown>,
        index: number,
        needToFocus: boolean,
    ): Promise<void>;
}

interface EditorJsApi {
    blocks: BlocksApi;
}

interface EditorJsBlock {
    id: string;
}

interface MediaFilePayload {
    url: string;
    name?: string;
    caption?: string;
    alt?: string;
    width?: number;
    height?: number;
    mediaId?: string;
    mimeType?: string;
}

const globalState = {
    isActive: false,
    activeBlockIndex: null as number | null,
    activeBlockId: '',
};

// Single shared listener — delegates to the active instance via globalState.activeBlockId
const instances = new Map<string, MediaLibraryTool>();
let sharedListenerAttached = false;

function attachSharedListener() {
    if (sharedListenerAttached) return;
    sharedListenerAttached = true;

    window.addEventListener('media-library-selected-item', async (e: Event) => {
        const customEvent = e as CustomEvent;
        if (globalState.isActive) return;

        // Route to the instance that opened the picker
        const instance = instances.get(globalState.activeBlockId);
        if (!instance) return;

        globalState.isActive = true;
        try {
            await instance.handleMediaSelected(customEvent);
        } finally {
            globalState.isActive = false;
        }
    });
}

export default class MediaLibraryTool {
    private api: EditorJsApi;
    private wrapper: HTMLElement;
    private block: EditorJsBlock;
    private hasMedia: boolean = false;
    private placeholder: HTMLElement | null = null;

    static get toolbox() {
        return {
            title: 'Media Library',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M4 13m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M14 4m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M14 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /></svg>',
        };
    }

    constructor({ api, config, block }: { api: EditorJsApi; config: Record<string, unknown>; block: EditorJsBlock }) {
        this.api = api;
        this.block = block;
        this.wrapper = document.createElement('div');

        // Register this instance and ensure the shared listener exists
        instances.set(block.id, this);
        attachSharedListener();
    }

    async handleMediaSelected(customEvent: CustomEvent) {
        const file = customEvent.detail.media as MediaFilePayload;
        const mediaLibOpenedVia = customEvent.detail?.openedVia === 'programmatic';
        console.log('Media selected:', file?.name, 'Media library opened via editor:', mediaLibOpenedVia);

        try {
            let currentIndex = this.api.blocks.getCurrentBlockIndex();

            // Delete the media library block first if it was opened programmatically
            if (mediaLibOpenedVia && globalState.activeBlockIndex !== null) {
                const blockToDelete = this.api.blocks.getBlockByIndex(globalState.activeBlockIndex);
                if (blockToDelete && blockToDelete.id === globalState.activeBlockId) {
                    this.api.blocks.delete(globalState.activeBlockIndex);
                    currentIndex = globalState.activeBlockIndex;
                }
            } else if (!mediaLibOpenedVia) {
                currentIndex = this.api.blocks.getBlocksCount();
            }

            currentIndex =
                currentIndex < 0 ? (globalState.activeBlockIndex ?? this.api.blocks.getBlocksCount()) : currentIndex;

            await this.insertImage(file, currentIndex);

            // Hide the placeholder since media was selected
            this.hasMedia = true;
            if (this.placeholder) {
                this.placeholder.style.display = 'none';
            }

            globalState.activeBlockIndex = null;
            globalState.activeBlockId = '';
        } catch (error) {
            console.error('Error inserting image block:', error);
        }
    }

    private async insertImage(file: MediaFilePayload, index: number) {
        const imageData = {
            success: 1,
            url: file.url,
            file: {
                url: file.url,
            },
            caption: file.caption || file.name,
            alt: file.alt || '',
            width: file.width || undefined,
            height: file.height || undefined,
            mediaId: file.mediaId || undefined,
            mimeType: file.mimeType || undefined,
            withBorder: true,
            withBackground: true,
            stretched: false,
        };
        return this.api.blocks.insert(
            'image', // Tool - assuming 'image' or 'advancedImage' is available.
            // Wait, if 'image' is alias to AdvancedImageTool, this works.
            imageData, // Block's data
            {}, // config
            index, // at current index
            true, // focus?
        );
    }

    openMediaLib() {
        // Store the current block index in global state
        globalState.activeBlockIndex = this.api.blocks.getCurrentBlockIndex();
        globalState.activeBlockId = this.block.id;
        window.dispatchEvent(
            new CustomEvent('media-library-open', {
                detail: {
                    source: 'editor',
                },
            }),
        );
        console.log('Global state:', globalState);
    }

    render() {
        this.wrapper.classList.add('cdx-media-library', 'ob-plugin');

        this.placeholder = document.createElement('div');
        this.placeholder.classList.add('cdx-media-library-placeholder');
        this.placeholder.innerHTML = `
            <div class="cdx-media-library-placeholder-content">
                Click to select media from library
            </div>
        `;

        this.placeholder.addEventListener('click', () => {
            this.openMediaLib();
        });

        this.wrapper.appendChild(this.placeholder);

        return this.wrapper;
    }

    save() {
        return {};
    }

    destroy() {
        instances.delete(this.block.id);
    }
}
