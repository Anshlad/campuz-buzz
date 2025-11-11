/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

/**
 * Extract mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@[a-zA-Z0-9_]+/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(mention => mention.toLowerCase()) : [];
}

/**
 * Process text to convert hashtags and mentions into HTML spans
 */
export function renderTextWithHashtagsAndMentions(text: string): string {
  const combinedRegex = /(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g;
  
  return text.replace(combinedRegex, (match) => {
    if (match.startsWith('#')) {
      return `<span class="hashtag">${match}</span>`;
    } else if (match.startsWith('@')) {
      return `<span class="mention">${match}</span>`;
    }
    return match;
  });
}
