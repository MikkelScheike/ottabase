import { RenderFn } from "editorjs-blocks-react-renderer";
import { useState } from "react";

const Spoiler: RenderFn<{ text?: string }> = ({ data, className = "" }) => {
	const [isRevealed, setIsRevealed] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

	const handleClick = () => {
		setIsRevealed(!isRevealed);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isRevealed) {
			setTooltipPosition({ x: e.clientX, y: e.clientY });
		}
	};

	const handleMouseEnter = () => {
		if (!isRevealed) {
			setShowTooltip(true);
		}
	};

	const handleMouseLeave = () => {
		setShowTooltip(false);
	};

	const spoilerText = data?.text || "";

	return (
		<>
			<span
				onClick={handleClick}
				onMouseMove={handleMouseMove}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className={`${className} cursor-pointer select-none inline-block px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-900/20 transition-colors relative`}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
				aria-label={isRevealed ? "Hide spoiler" : "Reveal spoiler"}
			>
				<span
					className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words"
					style={{
						filter: isRevealed ? "none" : "blur(4px)",
						userSelect: isRevealed ? "auto" : "none",
						WebkitUserSelect: isRevealed ? "auto" : "none",
						WebkitFilter: isRevealed ? "none" : "blur(4px)",
					}}
				>
					{spoilerText || "Click to reveal"}
				</span>
			</span>
			{showTooltip && !isRevealed && (
				<div
					className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-800 rounded shadow-lg pointer-events-none whitespace-nowrap"
					style={{
						left: `${tooltipPosition.x + 10}px`,
						top: `${tooltipPosition.y + 10}px`,
					}}
				>
					Spoiler - click to reveal
				</div>
			)}
		</>
	);
};

export default Spoiler;
