import React, { useCallback, useEffect, useState } from "react";
import { Spotlight } from "./Spotlight";
import { SpotlightContext } from "./context";
import type { SpotlightConfig } from "./types";

export interface SpotlightProviderProps extends SpotlightConfig {
	children: React.ReactNode;
}

function parseShortcut(shortcut: string): (e: KeyboardEvent) => boolean {
	const parts = shortcut.toLowerCase().split("+").map((s) => s.trim());
	return (e: KeyboardEvent) => {
		const hasMod = parts.includes("mod") && (e.metaKey || e.ctrlKey);
		const hasShift = parts.includes("shift") && e.shiftKey;
		const hasAlt = parts.includes("alt") && e.altKey;
		const keyMatch = parts.some((part) => {
			if (part === "mod" || part === "shift" || part === "alt") return false;
			return e.key.toLowerCase() === part || e.key === part;
		});

		const modCount = [hasMod, hasShift, hasAlt, keyMatch].filter(Boolean).length;
		return modCount === parts.length;
	};
}

export function SpotlightProvider({
	children,
	enabled = true,
	shortcuts = ["/"],
	onSearch,
	renderResult,
	placeholder,
	emptyMessage,
	maxResults,
}: SpotlightProviderProps) {
	const [open, setOpen] = useState(false);

	const toggle = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	// Keyboard shortcut handling
	useEffect(() => {
		if (!enabled) return;

		const handlers = shortcuts.map((shortcut) => ({
			shortcut,
			check: parseShortcut(shortcut),
		}));

		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger if user is typing in an input/textarea
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			for (const { check } of handlers) {
				if (check(e)) {
					e.preventDefault();
					toggle();
					break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, shortcuts, toggle]);

	const contextValue = {
		open,
		setOpen,
		toggle,
	};

	return (
		<SpotlightContext.Provider value={contextValue}>
			{children}
			<Spotlight
				open={open}
				onOpenChange={setOpen}
				onSearch={onSearch}
				renderResult={renderResult}
				placeholder={placeholder}
				emptyMessage={emptyMessage}
				maxResults={maxResults}
			/>
		</SpotlightContext.Provider>
	);
}
