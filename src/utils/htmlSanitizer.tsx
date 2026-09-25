import React from 'react';
import DOMPurify from 'dompurify';

// Configure DOMPurify with safe defaults
const sanitizerConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class'
  ],
  // Allowlist explícita: http(s), mailto, tel, data:image/*;base64 e caminhos relativos.
  // Bloqueia data:text/html e qualquer outro esquema (o default do DOMPurify deixava
  // data:text/html passar em <img src>).
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,|[/#.])/i,
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
};

// DOMPurify libera QUALQUER data: URI em tags de mídia (img/audio/video) antes de
// consultar ALLOWED_URI_REGEXP - incluindo data:text/html. Este hook restringe
// data: a imagens em base64 (o fallback SVG de camisa depende disso).
const ALLOWED_DATA_IMAGE_URI = /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,/i;

DOMPurify.addHook('uponSanitizeAttribute', (_currentNode, data) => {
  const attrName = data.attrName?.toLowerCase();
  const value = data.attrValue ?? '';
  if (
    (attrName === 'src' || attrName === 'href') &&
    /^data:/i.test(value) &&
    !ALLOWED_DATA_IMAGE_URI.test(value)
  ) {
    data.keepAttr = false;
  }
});

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
// eslint-disable-next-line react-refresh/only-export-components
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, sanitizerConfig);
};

/**
 * Sanitizes plain text content to prevent XSS
 * @param text - The text to sanitize
 * @returns Sanitized text string
 */
// eslint-disable-next-line react-refresh/only-export-components
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Creates a safe component for rendering sanitized HTML
 */
interface SafeHtmlProps {
  html: string;
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className = '' }) => {
  const sanitizedHtml = sanitizeHtml(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
