import { Fragment, useMemo } from "react";
import { cleanContentFont } from "@/lib/cleanContent";
import { KnowledgeLink, KnowledgeLinkData } from "@/components/article/KnowledgeLink";

interface ArticleContentProps {
  html: string;
  links?: KnowledgeLinkData[];
  fontSize: number;
  contentRef?: React.RefObject<HTMLDivElement>;
}

const BLOCK_RE = /<div[^>]*data-knowledge-link="([^"]+)"[^>]*>[\s\S]*?<\/div>/gi;

/**
 * Renders article HTML and swaps every in-body knowledge-link marker
 * for a live block. Articles without markers render exactly as before.
 */
export const ArticleContent = ({ html, links = [], fontSize, contentRef }: ArticleContentProps) => {
  const parts = useMemo(() => {
    const cleaned = cleanContentFont(html || "");
    const chunks: { type: "html" | "link"; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    BLOCK_RE.lastIndex = 0;
    while ((match = BLOCK_RE.exec(cleaned)) !== null) {
      chunks.push({ type: "html", value: cleaned.slice(lastIndex, match.index) });
      chunks.push({ type: "link", value: match[1] });
      lastIndex = match.index + match[0].length;
    }
    chunks.push({ type: "html", value: cleaned.slice(lastIndex) });
    return chunks;
  }, [html]);

  const byKey = useMemo(() => {
    const map = new Map<string, KnowledgeLinkData>();
    links.forEach((l) => map.set(l.anchor_key, l));
    return map;
  }, [links]);

  const usedKeys = new Set(parts.filter((p) => p.type === "link").map((p) => p.value));
  const trailing = links.filter((l) => !usedKeys.has(l.anchor_key));

  return (
    <div
      ref={contentRef}
      className="site-content article-body article-surface"
      style={{ padding: "15px", borderRadius: "20px", ["--article-font-size" as any]: `${fontSize}px` }}
    >
      {parts.map((part, i) =>
        part.type === "html" ? (
          part.value ? <div key={i} dangerouslySetInnerHTML={{ __html: part.value }} /> : <Fragment key={i} />
        ) : (
          (() => {
            const link = byKey.get(part.value);
            return link ? <KnowledgeLink key={i} link={link} /> : <Fragment key={i} />;
          })()
        ),
      )}

      {/* Links saved without an in-body marker still appear, at the end of the passage. */}
      {trailing.map((link) => (
        <KnowledgeLink key={link.id} link={link} />
      ))}
    </div>
  );
};

export default ArticleContent;
