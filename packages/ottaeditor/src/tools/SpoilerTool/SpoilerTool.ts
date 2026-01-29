import type { API, BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";
import "./SpoilerTool.css";

interface SpoilerConfig {
	placeholder?: string;
}

interface SpoilerData {
	text: string;
}

export default class SpoilerTool implements BlockTool {
	private api: API;
	private data: SpoilerData;
	private config: SpoilerConfig;
	private wrapper: HTMLElement | null = null;

	static get CSS() {
		return {
			baseClass: "cdx-spoiler",
			wrapper: "cdx-spoiler__wrapper",
			textarea: "cdx-spoiler__textarea",
		};
	}

	static get toolbox() {
		return {
			title: "Spoiler",
			icon: '<svg width="17" height="15" viewBox="0 0 336 276" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M168 0C75.298 0 0 75.298 0 168C0 260.702 75.298 336 168 336C260.702 336 336 260.702 336 168C336 75.298 260.702 0 168 0ZM168 304C93.308 304 32 242.692 32 168C32 93.308 93.308 32 168 32C242.692 32 304 93.308 304 168C304 242.692 242.692 304 168 304Z" fill="currentColor"/><path d="M168 80C151.327 80 138 93.327 138 110C138 126.673 151.327 140 168 140C184.673 140 198 126.673 198 110C198 93.327 184.673 80 168 80ZM168 196C151.327 196 138 209.327 138 226C138 242.673 151.327 256 168 256C184.673 256 198 242.673 198 226C198 209.327 184.673 196 168 196Z" fill="currentColor"/></svg>',
		};
	}

	static get enableLineBreaks() {
		return true;
	}

	constructor({ data, config, api }: BlockToolConstructorOptions<SpoilerData, SpoilerConfig>) {
		this.api = api;
		this.config = config || {};
		this.data = {
			text: data?.text || "",
		};
	}

	render(): HTMLElement {
		const wrapper = document.createElement("div");
		wrapper.classList.add(SpoilerTool.CSS.baseClass, SpoilerTool.CSS.wrapper);

		const textarea = document.createElement("textarea");
		textarea.classList.add(SpoilerTool.CSS.textarea);
		textarea.placeholder = this.config.placeholder || "Enter spoiler text...";
		textarea.value = this.data.text;
		textarea.rows = 3;

		textarea.addEventListener("input", (event) => {
			const target = event.target as HTMLTextAreaElement;
			this.data.text = target.value;
		});

		wrapper.appendChild(textarea);

		this.wrapper = wrapper;

		return wrapper;
	}

	save(): SpoilerData {
		return this.data;
	}

	validate(savedData: SpoilerData): boolean {
		return savedData.text.trim() !== "";
	}
}
