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

/**
 * ألوان خلفية منطقة قراءة المقال.
 * إذا كانت قيمة background مختلفة عن القيم المعروفة
 * سيتم استخدام لون الورق الافتراضي.
 */
const BACKGROUND_COLORS: Record<string, string> = {
  paper: "#F8F5EF",
  white: "#FFFFFF",
  cream: "#FFF4E3",
  mint: "#EDF7F2",
};

export const ArticleContent = ({
  html,
  links = [],
  fontSize,
  background = "paper",
  contentRef,
}: ArticleContentProps) => {
  /**
   * تقسيم محتوى المقال إلى:
   * - HTML عادي
   * - Knowledge Links
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
      // المحتوى الموجود قبل Knowledge Link
      if (match.index > lastIndex) {
        chunks.push({
          type: "html",
          value: cleaned.slice(lastIndex, match.index),
        });
      }

      // Knowledge Link
      chunks.push({
        type: "link",
        value: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    // بقية المقال
    if (lastIndex < cleaned.length) {
      chunks.push({
        type: "html",
        value: cleaned.slice(lastIndex),
      });
    }

    return chunks;
  }, [html]);

  /**
   * ربط Knowledge Links بالمفتاح
   */
  const byKey = useMemo(() => {
    const map = new Map<string, KnowledgeLinkData>();

    links.forEach((link) => {
      map.set(link.anchor_key, link);
    });

    return map;
  }, [links]);

  /**
   * معرفة الروابط المستخدمة داخل المقال
   */
  const usedKeys = useMemo(() => {
    return new Set(
      parts
        .filter((part) => part.type === "link")
        .map((part) => part.value),
    );
  }, [parts]);

  /**
   * الروابط التي لا يوجد لها Marker داخل المقال
   */
  const trailing = useMemo(() => {
    return links.filter(
      (link) => !usedKeys.has(link.anchor_key),
    );
  }, [links, usedKeys]);

  /**
   * لون الخلفية الحالي
   */
  const currentBackground =
    BACKGROUND_COLORS[String(background)] ??
    BACKGROUND_COLORS.paper;

  return (
    <div
      ref={contentRef}
      className="site-content article-body article-surface"
      data-reading-background={background}
      style={
        {
          padding: "15px",
          borderRadius: "20px",

          // تغيير الخلفية فعليًا
          backgroundColor: currentBackground,

          // حجم الخط
          "--article-font-size": `${fontSize}px`,

          // انتقال ناعم عند تغيير اللون
          transition:
            "background-color 220ms ease, color 220ms ease",
        } as React.CSSProperties
      }
    >
      {parts.map((part, index) => {
        /**
         * HTML العادي
         */
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

        /**
         * Knowledge Link
         */
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

      {/**
       * الروابط المحفوظة التي ليس لها مكان
       * محدد داخل نص المقال
       */}
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
