import { Head, usePage } from "@inertiajs/react";
import type { SeoData } from "@/types/seo";

interface PageProps {
    [key: string]: unknown;
    name?: string;
    seo?: SeoData;
}

export function SeoHead({ seo }: { seo?: SeoData }) {
    const page = usePage<PageProps>();
    const appName = page.props.name ?? "Wandireo";
    const resolvedSeo = seo ?? page.props.seo ?? {};
    const title = resolvedSeo.title ?? appName;
    const description = resolvedSeo.description;
    const canonical = resolvedSeo.canonical;
    const image = resolvedSeo.image;
    const robots = resolvedSeo.robots;
    const type = resolvedSeo.type ?? "website";
    const siteName = resolvedSeo.siteName ?? appName;
    const twitterCard = resolvedSeo.twitterCard ?? "summary_large_image";

    return (
        <Head title={title}>
            {description ? (
                <meta name="description" content={description} />
            ) : null}
            {robots ? <meta name="robots" content={robots} /> : null}
            {canonical ? <link rel="canonical" href={canonical} /> : null}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            {description ? (
                <meta property="og:description" content={description} />
            ) : null}
            {canonical ? <meta property="og:url" content={canonical} /> : null}
            <meta property="og:site_name" content={siteName} />
            {image ? <meta property="og:image" content={image} /> : null}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
            {description ? (
                <meta name="twitter:description" content={description} />
            ) : null}
            {image ? <meta name="twitter:image" content={image} /> : null}
            {resolvedSeo.publishedTime ? (
                <meta
                    property="article:published_time"
                    content={resolvedSeo.publishedTime}
                />
            ) : null}
            {resolvedSeo.modifiedTime ? (
                <meta
                    property="article:modified_time"
                    content={resolvedSeo.modifiedTime}
                />
            ) : null}
        </Head>
    );
}

export default SeoHead;
