import { Minus, Plus, RotateCcw, ALargeSmall } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIN = 14;
const MAX = 32;
const DEFAULT = 17;

interface TextZoomControlProps {
  value: number;
  onChange: (next: number) => void;
  className?: string;
}

export const TextZoomControl = ({ value, onChange, className }: TextZoomControlProps) => {
  const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 ${className || ""}`}
    >
      <ALargeSmall className="w-4 h-4 text-muted-foreground" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="تصغير النص"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= MIN}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
        {value}px
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="تكبير النص"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= MAX}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="إعادة حجم النص"
        onClick={() => onChange(DEFAULT)}
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export const DEFAULT_ARTICLE_FONT_SIZE = DEFAULT;
