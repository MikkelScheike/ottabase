// ---------------------------------------------------------------------------
// Ottamenu – Footer menu renderer
// Multi-column footer layout. Top-level items become column headers;
// children are links beneath each header. Common for site footers.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { buildItemTree, type MenuItemTreeNode } from '../persistence/treeUtils';
import type { MenuItemDto } from '../persistence/types';
import { MenuItemLink } from './MenuItemLink';

export interface FooterMenuRendererProps {
    items: MenuItemDto[];
    pathname: string;
}

// ── Single footer column ─────────────────────────────────────────────────
function FooterColumn({ node, pathname }: { node: MenuItemTreeNode; pathname: string }) {
    return (
        <div className="flex flex-col gap-2">
            {/* Column header */}
            <span className="text-sm font-semibold text-foreground">{node.item.name}</span>

            {/* Links */}
            <ul className="flex flex-col gap-1">
                {node.children.map((child) => (
                    <li key={child.item.id}>
                        <MenuItemLink item={child.item} pathname={pathname} className="!px-0 !py-1 text-sm" />
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Renders a footer-style menu with multiple columns.
 *
 * Data shape:
 * - Level 0: column headers (e.g. "Company", "Product", "Resources")
 * - Level 1: links under each column
 *
 * Top-level items without children are rendered as standalone links.
 */
export function FooterMenuRenderer({ items, pathname }: FooterMenuRendererProps) {
    const tree = useMemo(() => buildItemTree(items), [items]);

    // Separate columns (items with children) from standalone links
    const columns = tree.filter((n) => n.children.length > 0);
    const standalone = tree.filter((n) => n.children.length === 0);

    return (
        <nav className="flex flex-wrap gap-10">
            {columns.map((col) => (
                <FooterColumn key={col.item.id} node={col} pathname={pathname} />
            ))}

            {/* Standalone top-level links grouped into one implicit column */}
            {standalone.length > 0 && (
                <div className="flex flex-col gap-1">
                    {standalone.map((n) => (
                        <MenuItemLink
                            key={n.item.id}
                            item={n.item}
                            pathname={pathname}
                            className="!px-0 !py-1 text-sm"
                        />
                    ))}
                </div>
            )}
        </nav>
    );
}
