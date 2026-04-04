/**
 * @file blog.ts
 * @description Type pour les articles de blog Wandireo.
 */

export const BlogStatusNames = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
} as const;

export type BlogStatus = (typeof BlogStatusNames)[keyof typeof BlogStatusNames];

export interface BlogPost {
    id: string;
    /** Identifiant URL-friendly unique (ex: "5-jours-en-corse-guide-complet"). */
    slug: string;
    title: string;
    /** Résumé court affiché dans les listes et les aperçus. */
    excerpt: string;
    /** Contenu complet de l'article en HTML. Doit être assaini avant rendu. */
    content: string;
    /** URL absolue ou chemin relatif vers l'image principale de l'article. */
    coverImage: string;
    /** Référence à l'AdminUser.id ou PartnerUser.id auteur de l'article. */
    authorId: string;
    status: BlogStatus;
    tags: string[];
    /** Null si le statut est DRAFT. */
    publishedAt: Date | null;
    updatedAt: Date;
}
