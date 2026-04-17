function stripImportedArtifactLines(value: string): string {
    const blockedLinePatterns = [
        /^\s*Le JSON que vous avez fourni/i,
        /^\s*Cependant,\s+il indique/i,
        /^\s*Voici les informations trouv[ée]es? dans le code/i,
        /^\s*"[^"]+"\s*:/,
    ];

    return value
        .split("\n")
        .filter((line) =>
            blockedLinePatterns.every((pattern) => !pattern.test(line)),
        )
        .join("\n");
}

function stripImportedArtifactPhrases(value: string): string {
    return value
        .replace(
            /Le JSON que vous avez fourni ne contient pas le prix total de l['’]activité\.?/gi,
            " ",
        )
        .replace(
            /Cependant,\s*il indique qu['’]une caution de\s*[\d\s,.]+ ?€?\s*est requise pour la réservation\.?/gi,
            " ",
        )
        .replace(
            /Voici les informations trouv[ée]es? dans le code\s*:?/gi,
            " ",
        )
        .replace(/"is_deposit_required"\s*:\s*true[^.\n)]*[\).]?/gi, " ")
        .replace(/"deposit_offset"\s*:\s*\d+[^.\n)]*[\).]?/gi, " ")
        .replace(
            /"processor_currency"\s*:\s*"?[a-z]{3}"?[^.\n)]*[\).]?/gi,
            " ",
        );
}

export function stripMarkdownToText(value: string): string {
    return stripImportedArtifactPhrases(stripImportedArtifactLines(value))
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s*/gm, "")
        .replace(/^\s{0,3}[-*+]\s+/gm, "")
        .replace(/^\s{0,3}\d+\.\s+/gm, "")
        .replace(/^\s{0,3}>\s?/gm, "")
        .replace(/^\s{0,3}```[\s\S]*?^\s{0,3}```/gm, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[*_~]/g, "")
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ ]{2,}/g, " ")
        .trim();
}

export function markdownToSingleLineText(value: string): string {
    return stripMarkdownToText(value)
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}
