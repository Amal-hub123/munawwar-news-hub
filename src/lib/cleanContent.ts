/**
 * Removes font-family declarations from HTML content
 * so the site's default font (Greta Arabic) is always used.
 * Handles: inline style attributes (double/single quotes) and <font face=""> tags.
 */
export function cleanContentFont(html: string): string {
  if (!html) return html;

  let result = html;

  // Remove font-family from inline style with double quotes
  result = result.replace(/style="([^"]*)"/gi, (_match, styleValue: string) => {
    const cleaned = styleValue
      .split(";")
      .filter((rule) => !rule.trim().toLowerCase().startsWith("font-family"))
      .join(";");
    return `style="${cleaned}"`;
  });

  // Remove font-family from inline style with single quotes
  result = result.replace(/style='([^']*)'/gi, (_match, styleValue: string) => {
    const cleaned = styleValue
      .split(";")
      .filter((rule) => !rule.trim().toLowerCase().startsWith("font-family"))
      .join(";");
    return `style='${cleaned}'`;
  });

  // Remove <font face="..."> attribute (TinyMCE legacy)
  result = result.replace(/(<font\b[^>]*)\sface="[^"]*"/gi, "$1");
  result = result.replace(/(<font\b[^>]*)\sface='[^']*'/gi, "$1");

  return result;
}
