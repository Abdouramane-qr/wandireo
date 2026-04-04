import DOMPurify from 'dompurify';

/**
 * Assainit une chaîne HTML avant rendu côté client via DOMPurify.
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p',
            'br',
            'strong',
            'em',
            'ul',
            'ol',
            'li',
            'h1',
            'h2',
            'h3',
            'h4',
            'a',
            'blockquote',
            'img',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
    });
}
