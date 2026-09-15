import { Fragment, useMemo } from "react";
import { cleanContentFont } from "@/lib/cleanContent";
import {
  KnowledgeLink,
  KnowledgeLinkData,
} from "@/components/article/KnowledgeLink";
import type { ReadingBackground } from "@/components/TextZoomControl";

interface ArticleContentProps {
  html: string;
  links?: KnowledgeLinkData[];
  fontSize: number;
  background?: ReadingBackground;
  contentRef?: React.RefObject<HTMLDivElement>;
}

const BLOCK_RE =
  /<div[^>]*data-knowledge-link="([^"]+)"[^>]*>[\s\S]*?<\/div>/gi;

/*
 * ألوان خلفية القراءة
 * متطابقة 100% مع القيم الموجودة في TextZoomControl
 */
const BACKGROUND_COLORS: Record<ReadingBackground, string> = {
  paper: "#F8F5EF",
  ivory: "#FFFDF5",
  sage: "#EEF4EC",
  mist: "#F1F3F4",
};

export const ArticleContent = ({
  html,
  links = [],
  fontSize,
  background = "paper",
  contentRef,
}: ArticleContentProps) => {
  /*
   * تجهيز محتوى المقال
   */
  const parts = useMemo(() => {
    const cleaned = cleanContentFont(html || "");

    const chunks: {
      type: "html" | "link";
      value: string;
    }[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    BLOCK_RE.lastIndex = 0;

    while ((match = BLOCK_RE.exec(cleaned)) !== null) {
      if (match.index > lastIndex) {
        chunks.push({
          type: "html",
          value: cleaned.slice(lastIndex, match.index),
        });
      }

      chunks.push({
        type: "link",
        value: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleaned.length) {
      chunks.push({
        type: "html",
        value: cleaned.slice(lastIndex),
      });
    }

    return chunks;
  }, [html]);

  /*
   * إنشاء Map للروابط
   */
  const byKey = useMemo(() => {
    const map = new Map<string, KnowledgeLinkData>();

    links.forEach((link) => {
      map.set(link.anchor_key, link);
    });

    return map;
  }, [links]);

  /*
   * معرفة Knowledge Links المستخدمة
   */
  const usedKeys = useMemo(() => {
    return new Set(
      parts
        .filter((part) => part.type === "link")
        .map((part) => part.value),
    );
  }, [parts]);

  /*
   * الروابط التي ليس لها Marker داخل المقال
   */
  const trailing = useMemo(() => {
    return links.filter(
      (link) => !usedKeys.has(link.anchor_key),
    );
  }, [links, usedKeys]);

  /*
   * تحديد لون الخلفية المختار
   */
  const currentBackground =
    BACKGROUND_COLORS[background] ?? BACKGROUND_COLORS.paper;

  return (
    <div
      ref={contentRef}
      className={`
        site-content
        article-body
        article-surface
        article-surface-${background}
      `}
      data-reading-background={background}
      style={
        {
          padding: "15px",
          borderRadius: "20px",

          /*
           * الخلفية تتغير مباشرة عند اختيار اللون
           */
          backgroundColor: currentBackground,

          /*
           * حجم خط المقال
           */
          "--article-font-size": `${fontSize}px`,

          /*
           * حركة ناعمة عند تغيير الخلفية
           */
          transition: "background-color 250ms ease",
        } as React.CSSProperties
      }
    >
      {parts.map((part, index) => {
        if (part.type === "html") {
          if (!part.value) {
            return <Fragment key={index} />;
          }

          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{
                __html: part.value,
              }}
            />
          );
        }

        const link = byKey.get(part.value);

        if (!link) {
          return <Fragment key={index} />;
        }

        return (
          <KnowledgeLink
            key={index}
            link={link}
          />
        );
      })}

      {trailing.map((link) => (
        <KnowledgeLink
          key={link.id}
          link={link}
        />
      ))}
    </div>
  );
};

export default ArticleContent;
