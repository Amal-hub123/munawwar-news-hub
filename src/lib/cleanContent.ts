/**
 * Removes font-family declarations from inline styles in HTML content
 * so the site's default font (Greta Arabic) is always used.
 */
export function cleanContentFont(html: string): string {
  if (!html) return html;

  // Remove font-family from inline style attributes
  return html.replace(
    /style="([^"]*)"/gi,
    (_match, styleValue: string) => {
      const cleaned = styleValue
        .split(";")
        .filter((rule) => !rule.trim().toLowerCase().startsWith("font-family"))
        .join(";");
      return `style="${cleaned}"`;
    }
  );
}
