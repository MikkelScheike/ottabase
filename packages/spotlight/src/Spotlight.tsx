import { cn, Dialog, DialogOverlay, DialogTitle } from "@ottabase/ui-shadcn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconSearch, IconX } from "@tabler/icons-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SpotlightProps, SpotlightResult } from "./types";

const DEFAULT_RESULTS: SpotlightResult[] = [
	{ id: "home", label: "Home", onSelect: () => console.log("Home") },
	{ id: "about", label: "About us", onSelect: () => console.log("About") },
	{ id: "contacts", label: "Contacts", onSelect: () => console.log("Contacts") },
	{ id: "blog", label: "Blog", onSelect: () => console.log("Blog") },
	{ id: "careers", label: "Careers", onSelect: () => console.log("Careers") },
	{ id: "terms", label: "Terms of service", onSelect: () => console.log("Terms") },
];

function defaultRenderResult(result: SpotlightResult, index: number, isSelected: boolean) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-75",
				isSelected && "bg-accent text-accent-foreground"
			)}
		>
			{result.icon && <div className="flex-shrink-0">{result.icon}</div>}
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm">{result.label}</div>
				{result.description && (
					<div className="text-xs text-muted-foreground mt-0.5 truncate">
						{result.description}
					</div>
				)}
			</div>
		</div>
	);
}

export function Spotlight({
	open: openProp,
	onOpenChange,
	placeholder = "Search...",
	emptyMessage = "No results found",
	onSearch,
	renderResult = defaultRenderResult,
	maxResults = 50,
	className,
}: SpotlightProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SpotlightResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	const open = openProp ?? internalOpen;
	const setOpen = useCallback(
		(value: boolean) => {
			if (onOpenChange) {
				onOpenChange(value);
			} else {
				setInternalOpen(value);
			}
		},
		[onOpenChange]
	);

	// Search handler
	const performSearch = useCallback(
		async (searchQuery: string) => {
			if (!searchQuery.trim()) {
				setResults(onSearch ? [] : DEFAULT_RESULTS);
				setSelectedIndex(0);
				return;
			}

			setIsLoading(true);
			try {
				let searchResults: SpotlightResult[] = [];

				if (onSearch) {
					const fetchedResults = await onSearch(searchQuery);
					searchResults = Array.isArray(fetchedResults) ? fetchedResults : [];
				} else {
					// Default search logic
					const lowerQuery = searchQuery.toLowerCase();
					searchResults = DEFAULT_RESULTS.filter((result) => {
						const matchesLabel = result.label.toLowerCase().includes(lowerQuery);
						const matchesKeywords =
							result.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery)) ?? false;
						return matchesLabel || matchesKeywords;
					});
				}

				const limitedResults = searchResults.slice(0, maxResults);
				setResults(limitedResults);
				setSelectedIndex(limitedResults.length > 0 ? 0 : -1);
			} catch (error) {
				console.error("Spotlight search error:", error);
				setResults([]);
				setSelectedIndex(-1);
			} finally {
				setIsLoading(false);
			}
		},
		[onSearch, maxResults]
	);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			performSearch(query);
		}, 150);

		return () => clearTimeout(timer);
	}, [query, performSearch]);

	// Reset when opening
	useEffect(() => {
		if (open) {
			setQuery("");
			setSelectedIndex(0);
			// Focus input after dialog animation
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [open]);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
			} else if (e.key === "Enter") {
				e.preventDefault();
				if (selectedIndex >= 0 && results[selectedIndex]) {
					results[selectedIndex].onSelect?.();
					setOpen(false);
				}
			} else if (e.key === "Escape") {
				e.preventDefault();
				setOpen(false);
			}
		},
		[results, selectedIndex, setOpen]
	);

	// Scroll selected item into view
	useEffect(() => {
		if (selectedIndex >= 0 && resultsRef.current) {
			const selectedElement = resultsRef.current.querySelector(
				`[data-index="${selectedIndex}"]`
			) as HTMLElement;
			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [selectedIndex]);

	const filteredResults = useMemo(() => results, [results]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogPrimitive.Portal>
				<DialogOverlay className="bg-black/40 backdrop-blur-sm supports-[backdrop-filter]:bg-black/30" />
				<DialogPrimitive.Content
					className={cn(
						"fixed left-[50%] top-[10%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-0 p-0 gap-0 overflow-hidden",
						"bg-white dark:bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-background/80",
						"border shadow-lg rounded-lg",
						"data-[state=open]:animate-in data-[state=closed]:animate-out",
						"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
						"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
						"data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[10%]",
						"data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[10%]",
						"duration-100",
						className
					)}
					onKeyDown={handleKeyDown}
				>
				<DialogTitle className="sr-only">Search</DialogTitle>
				{/* Search Input */}
				<div className="flex items-center gap-3 border-b px-4 py-3">
					<IconSearch className="h-5 w-5 text-muted-foreground flex-shrink-0" />
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={placeholder}
						className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
						autoFocus
					/>
					{query && (
						<button
							type="button"
							onClick={() => setQuery("")}
							className="text-muted-foreground hover:text-foreground transition-colors duration-75"
							aria-label="Clear search"
						>
							<IconX className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* Results */}
				<div
					ref={resultsRef}
					className="max-h-[400px] overflow-y-auto overflow-x-hidden"
				>
					{isLoading ? (
						<div className="px-4 py-8 text-center text-sm text-muted-foreground">
							Searching...
						</div>
					) : filteredResults.length === 0 ? (
						<div className="px-4 py-8 text-center text-sm text-muted-foreground">
							{emptyMessage}
						</div>
					) : (
						<div className="py-2">
							{filteredResults.map((result, index) => (
								<div
									key={result.id}
									data-index={index}
									onClick={() => {
										result.onSelect?.();
										setOpen(false);
									}}
									onMouseEnter={() => setSelectedIndex(index)}
								>
									{renderResult(result, index, index === selectedIndex)}
								</div>
							))}
						</div>
					)}
				</div>
			</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</Dialog>
	);
}
