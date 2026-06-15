const WORDS_PER_MINUTE = 200;

export function calculateReadingTimeMinutes(markdown: string): number {
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, " ");
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]*`/g, " ");
  const plainText = withoutInlineCode.replace(/[#>*_\-\[\]()!]/g, " ");
  const words = plainText.split(/\s+/).filter((word) => word.length > 0).length;

  if (words === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
