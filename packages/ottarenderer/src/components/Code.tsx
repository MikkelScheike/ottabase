import { useEffect, useState } from 'react';
import { RenderFn } from "editorjs-blocks-react-renderer";
import { createStarryNight, common } from '@wooorm/starry-night';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

// Language mapping for common aliases
const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript', // TSX uses TypeScript highlighting
    'py': 'python',
    'sh': 'shell',
    'bash': 'shell',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
};

// Starry-night instance (singleton)
let starryNightInstance: Awaited<ReturnType<typeof createStarryNight>> | null = null;

// Initialize starry-night with common grammars
const initStarryNight = async () => {
    if (starryNightInstance) return starryNightInstance;

    // Use the 'common' bundle which includes the most popular languages
    // This is ~100KB but covers most use cases
    starryNightInstance = await createStarryNight(common);
    return starryNightInstance;
};

const Code: RenderFn<{ code: string; language?: string }> = ({ data }) => {
    const { code, language = 'text' } = data;
    const [highlighted, setHighlighted] = useState<React.ReactNode>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const highlight = async () => {
            try {
                const starryNight = await initStarryNight();

                // Normalize language name
                const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase();

                console.log('Code highlighting:', {
                    original: language,
                    normalized: normalizedLang
                });

                // Get scope for the language
                const scope = starryNight.flagToScope(normalizedLang);

                console.log('Starry-night scope:', scope);

                if (scope) {
                    // Highlight the code
                    const tree = starryNight.highlight(code, scope);

                    console.log('Highlighted tree:', tree);

                    // Convert HAST to React elements
                    const result = toJsxRuntime(tree, {
                        Fragment,
                        jsx,
                        jsxs,
                    });

                    setHighlighted(result);
                } else {
                    console.warn('No scope found for language:', normalizedLang);
                    // Language not supported, render plain text
                    setHighlighted(<code>{code}</code>);
                }
            } catch (error) {
                console.error('Syntax highlighting error:', error);
                setHighlighted(<code>{code}</code>);
            } finally {
                setIsLoading(false);
            }
        };

        highlight();
    }, [code, language]);

    return (
        <div className="cdc-content-code my-4">
            <div className="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
                {language && (
                    <div className="px-4 py-2 bg-muted border-b border-border">
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                            {language}
                        </span>
                    </div>
                )}
                <pre className="p-4 overflow-x-auto">
                    {isLoading ? (
                        <code className="text-sm font-mono text-foreground">
                            {code}
                        </code>
                    ) : (
                        <code className="text-sm font-mono">
                            {highlighted}
                        </code>
                    )}
                </pre>
            </div>
        </div>
    );
}

export default Code;
