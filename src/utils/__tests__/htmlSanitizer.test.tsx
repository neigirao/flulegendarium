import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { sanitizeHtml, sanitizeText, SafeHtml } from '../htmlSanitizer';

// Helper to query rendered content
const getByText = (container: HTMLElement, text: string) => {
  const elements = container.querySelectorAll('*');
  for (const el of elements) {
    if (el.textContent?.includes(text)) return el;
  }
  return null;
};

describe('htmlSanitizer', () => {
  describe('sanitizeHtml', () => {
    describe('allowed tags', () => {
      it('should allow safe tags like p, strong, em', () => {
        const html = '<p><strong>Bold</strong> and <em>italic</em></p>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<p>');
        expect(result).toContain('<strong>');
        expect(result).toContain('<em>');
      });

      it('should allow heading tags', () => {
        const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<h1>');
        expect(result).toContain('<h2>');
        expect(result).toContain('<h3>');
      });

      it('should allow list tags', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>');
      });

      it('should allow blockquote', () => {
        const html = '<blockquote>Famous quote</blockquote>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<blockquote>');
      });

      it('should allow anchor tags with href', () => {
        const html = '<a href="https://example.com">Link</a>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<a');
        expect(result).toContain('href="https://example.com"');
      });

      it('should allow img tags with src and alt', () => {
        const html = '<img src="https://example.com/image.jpg" alt="Description">';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<img');
        expect(result).toContain('src="https://example.com/image.jpg"');
        expect(result).toContain('alt="Description"');
      });

      it('should allow br tags', () => {
        const html = 'Line 1<br>Line 2';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('<br');
      });
    });

    describe('forbidden tags removal', () => {
      it('should remove script tags', () => {
        const html = '<p>Safe</p><script>alert("XSS")</script>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert');
        expect(result).toContain('<p>Safe</p>');
      });

      it('should remove iframe tags', () => {
        const html = '<p>Content</p><iframe src="https://evil.com"></iframe>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('<iframe');
        expect(result).not.toContain('evil.com');
      });

      it('should remove object tags', () => {
        const html = '<object data="malware.swf"></object>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('<object');
      });

      it('should remove embed tags', () => {
        const html = '<embed src="plugin.swf">';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('<embed');
      });

      it('should remove form and input tags', () => {
        const html = '<form action="/steal"><input type="password"></form>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('<form');
        expect(result).not.toContain('<input');
      });
    });

    describe('forbidden attributes removal', () => {
      it('should remove onclick attributes', () => {
        const html = '<p onclick="alert(1)">Click me</p>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('onclick');
        expect(result).toContain('<p>');
      });

      it('should remove onerror attributes', () => {
        const html = '<img src="x" onerror="alert(1)">';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('onerror');
      });

      it('should remove onload attributes', () => {
        const html = '<body onload="malicious()">';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('onload');
      });

      it('should remove onmouseover attributes', () => {
        const html = '<div onmouseover="steal()">Hover me</div>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('onmouseover');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const result = sanitizeHtml('');
        
        expect(result).toBe('');
      });

      it('should handle null/undefined gracefully', () => {
        expect(sanitizeHtml(null as any)).toBe('');
        expect(sanitizeHtml(undefined as any)).toBe('');
      });

      it('should handle plain text without tags', () => {
        const text = 'Just plain text without HTML';
        const result = sanitizeHtml(text);
        
        expect(result).toBe('Just plain text without HTML');
      });

      it('should handle nested dangerous content', () => {
        const html = '<div><script>alert(1)</script><p>Safe</p></div>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('<script>');
        // div is not in allowed tags, so it may be stripped
        expect(result).toContain('Safe');
      });

      it('should handle malformed HTML', () => {
        const html = '<p>Unclosed paragraph<strong>Bold';
        const result = sanitizeHtml(html);
        
        // DOMPurify should handle this gracefully
        expect(result).toContain('Unclosed paragraph');
        expect(result).toContain('Bold');
      });

      it('should preserve class attribute', () => {
        const html = '<p class="highlight">Styled text</p>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('class="highlight"');
      });

      it('should preserve title attribute', () => {
        const html = '<a href="#" title="Tooltip">Link</a>';
        const result = sanitizeHtml(html);
        
        expect(result).toContain('title="Tooltip"');
      });
    });

    describe('XSS prevention', () => {
      it('should prevent javascript: URLs in href', () => {
        const html = '<a href="javascript:alert(1)">Click</a>';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('javascript:');
      });

      it('should prevent data: URLs in src', () => {
        const html = '<img src="data:text/html,<script>alert(1)</script>">';
        const result = sanitizeHtml(html);
        
        expect(result).not.toContain('data:text/html');
      });

      it('should handle encoded XSS attempts', () => {
        const html = '<p>&#60;script&#62;alert(1)&#60;/script&#62;</p>';
        const result = sanitizeHtml(html);
        
        // Should not execute even after decoding
        expect(result).not.toContain('<script>');
      });
    });
  });

  describe('sanitizeText', () => {
    it('should strip all HTML tags', () => {
      const html = '<p><strong>Bold</strong> text</p>';
      const result = sanitizeText(html);
      
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<strong>');
      expect(result).toBe('Bold text');
    });

    it('should handle empty input', () => {
      expect(sanitizeText('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeText(null as any)).toBe('');
      expect(sanitizeText(undefined as any)).toBe('');
    });

    it('should preserve plain text', () => {
      const text = 'No HTML here';
      const result = sanitizeText(text);
      
      expect(result).toBe('No HTML here');
    });

    it('should remove all tags including safe ones', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeText(html);
      
      expect(result).toBe('Link');
    });

    it('should handle script content', () => {
      const html = '<script>alert(1)</script>Some text';
      const result = sanitizeText(html);
      
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });
  });

  describe('SafeHtml component', () => {
    it('should render sanitized HTML', () => {
      const { container } = render(<SafeHtml html="<p>Test paragraph</p>" />);
      
      expect(container.textContent).toContain('Test paragraph');
    });

    it('should apply className', () => {
      const { container } = render(
        <SafeHtml html="<p>Content</p>" className="custom-class" />
      );
      
      expect((container.firstChild as Element)?.className).toContain('custom-class');
    });

    it('should prevent XSS attacks', () => {
      const maliciousHtml = '<script>alert("XSS")</script><p>Safe content</p>';
      const { container } = render(<SafeHtml html={maliciousHtml} />);
      
      expect(container.textContent).toContain('Safe content');
      expect(container.querySelector('script')).toBeNull();
    });

    it('should handle empty HTML', () => {
      const { container } = render(<SafeHtml html="" />);
      
      expect(container.firstChild?.textContent).toBe('');
    });

    it('should render allowed formatting', () => {
      const { container } = render(<SafeHtml html="<strong>Bold</strong> and <em>italic</em>" />);
      
      expect(container.textContent).toContain('Bold');
      expect(container.textContent).toContain('italic');
    });

    it('should render links correctly', () => {
      const { container } = render(<SafeHtml html='<a href="https://example.com">Click here</a>' />);
      
      const link = container.querySelector('a');
      expect(link?.tagName).toBe('A');
      expect(link?.getAttribute('href')).toBe('https://example.com');
    });
  });
});
