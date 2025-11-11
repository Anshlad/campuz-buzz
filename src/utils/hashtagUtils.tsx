import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

/**
 * Render text with clickable hashtags
 */
export function renderTextWithHashtags(text: string): React.ReactNode {
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  const parts = text.split(hashtagRegex);

  return parts.map((part, index) => {
    if (part.match(hashtagRegex)) {
      const hashtag = part.slice(1).toLowerCase(); // Remove # and lowercase
      return (
        <Link
          key={index}
          to={`/?hashtag=${encodeURIComponent(hashtag)}`}
          className="text-primary hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
