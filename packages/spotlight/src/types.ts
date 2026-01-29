import { ReactNode } from "react";

export interface SpotlightResult {
	id: string;
	label: string;
	description?: string;
	icon?: ReactNode;
	keywords?: string[];
	onSelect?: () => void;
	[key: string]: unknown;
}

export interface SpotlightConfig {
	enabled?: boolean;
	shortcuts?: string[];
	placeholder?: string;
	emptyMessage?: string;
	onSearch?: (query: string) => Promise<SpotlightResult[]> | SpotlightResult[];
	renderResult?: (result: SpotlightResult, index: number, isSelected: boolean) => ReactNode;
	maxResults?: number;
}

export interface SpotlightContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
}

export interface SpotlightProps extends SpotlightConfig {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
}
