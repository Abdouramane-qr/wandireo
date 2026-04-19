import React from "react";
import { stripMarkdownToText } from "./textSanitizers";

function cleanRichText(value: string): string {
    return stripMarkdownToText(value)
        .replace(/^\s*[-*+]\s+/gm, "• ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export function renderInlineMarkdown(text: string): React.ReactNode[] {
    if (!text) return [];
    
    // Support basic markdown: bold, italic, code
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return tokens.filter(Boolean).map((token, index) => {
        if (token.startsWith("`") && token.endsWith("`")) {
            return (
                <code key={index} className="wdr-markdown-inline-code">
                    {token.slice(1, -1)}
                </code>
            );
        }

        if (token.startsWith("**") && token.endsWith("**")) {
            return <strong key={index}>{token.slice(2, -2)}</strong>;
        }

        if (token.startsWith("*") && token.endsWith("*")) {
            return <em key={index}>{token.slice(1, -1)}</em>;
        }

        return <React.Fragment key={index}>{token}</React.Fragment>;
    });
}

export function renderMarkdownBlocks(value: string): React.ReactNode[] {
    if (!value) return [];
    
    const lines = value.replace(/\r\n/g, "\n").split("\n");
    const blocks: React.ReactNode[] = [];
    let index = 0;

    while (index < lines.length) {
        const currentLine = lines[index].trim();

        if (!currentLine) {
            index += 1;
            continue;
        }

        // Headers
        const headingMatch = currentLine.match(/^(#{1,6})\s*(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const Tag = `h${level}` as keyof JSX.IntrinsicElements;

            blocks.push(
                <Tag
                    key={`heading-${index}`}
                    className={`wdr-markdown-heading wdr-markdown-heading--h${level}`}
                >
                    {renderInlineMarkdown(headingMatch[2].trim())}
                </Tag>,
            );
            index += 1;
            continue;
        }

        // Unordered lists
        if (/^[-*]\s+/.test(currentLine)) {
            const items: React.ReactNode[] = [];

            while (
                index < lines.length &&
                /^[-*]\s+/.test(lines[index].trim())
            ) {
                items.push(
                    <li key={`ul-item-${index}`}>
                        {renderInlineMarkdown(
                            lines[index].trim().replace(/^[-*]\s+/, ""),
                        )}
                    </li>,
                );
                index += 1;
            }

            blocks.push(
                <ul
                    key={`ul-${index}`}
                    className="wdr-markdown-list wdr-markdown-list--unordered"
                >
                    {items}
                </ul>,
            );
            continue;
        }

        // Ordered lists
        if (/^\d+\.\s+/.test(currentLine)) {
            const items: React.ReactNode[] = [];

            while (
                index < lines.length &&
                /^\d+\.\s+/.test(lines[index].trim())
            ) {
                items.push(
                    <li key={`ol-item-${index}`}>
                        {renderInlineMarkdown(
                            lines[index].trim().replace(/^\d+\.\s+/, ""),
                        )}
                    </li>,
                );
                index += 1;
            }

            blocks.push(
                <ol
                    key={`ol-${index}`}
                    className="wdr-markdown-list wdr-markdown-list--ordered"
                >
                    {items}
                </ol>,
            );
            continue;
        }

        // Blockquotes
        if (/^>\s?/.test(currentLine)) {
            const quoteLines: string[] = [];

            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
                index += 1;
            }

            blocks.push(
                <blockquote
                    key={`quote-${index}`}
                    className="wdr-markdown-quote"
                >
                    {renderInlineMarkdown(quoteLines.join(" "))}
                </blockquote>,
            );
            continue;
        }

        // Paragraphs
        const paragraphLines: string[] = [];

        while (index < lines.length) {
            const line = lines[index].trim();

            if (
                !line ||
                /^(#{1,6})\s*/.test(line) ||
                /^[-*]\s+/.test(line) ||
                /^\d+\.\s+/.test(line) ||
                /^>\s?/.test(line)
            ) {
                break;
            }

            paragraphLines.push(line);
            index += 1;
        }

        const paragraph = cleanRichText(paragraphLines.join("\n"));

        if (paragraph) {
            blocks.push(
                <p
                    key={`paragraph-${index}`}
                    className="wdr-markdown-paragraph"
                >
                    {renderInlineMarkdown(paragraph)}
                </p>,
            );
        }
    }

    return blocks;
}
