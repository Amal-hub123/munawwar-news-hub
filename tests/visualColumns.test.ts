import { describe, expect, it } from "bun:test";
import { excludeVisualColumnsFilter, normalizeColumnName } from "../src/lib/visualColumns";

const IMAGE_ID = "7756bd7a-1d87-47b1-a4ee-5f20a918df17";
const QUOTE_ID = "a975cc2b-e2ac-46cc-892e-e649b5b754d6";

// PostgREST `or=(a,b)` is a boolean OR; evaluate it the same way the API does.
const matchesFilter = (productId: string | null, filter: string | null) => {
  if (!filter) return true;
  const [isNull, notIn] = filter.split(",");
  if (isNull !== "product_id.is.null") throw new Error(`unexpected filter: ${filter}`);
  if (productId === null) return true;
  const ids = notIn.replace("product_id.not.in.(", "").replace(")", "").split(",");
  return !ids.includes(productId);
};

describe("article lists exclude the visual columns", () => {
  it("matches the image and quote columns even with diacritics", () => {
    expect(normalizeColumnName("الصورة")).toBe("الصورة");
    expect(normalizeColumnName("مُقتبس")).toBe("مقتبس");
    expect(["الصورة", "مقتبس"].includes(normalizeColumnName("مُقتبس"))).toBe(true);
    expect(["الصورة", "مقتبس"].includes(normalizeColumnName("النصّ"))).toBe(false);
    expect(["الصورة", "مقتبس"].includes(normalizeColumnName("عَلَم"))).toBe(false);
    expect(["الصورة", "مقتبس"].includes(normalizeColumnName("جليس"))).toBe(false);
    expect(["الصورة", "مقتبس"].includes(normalizeColumnName("أيلول"))).toBe(false);
    expect(["الصورة", "مقتبس"].includes(normalizeColumnName("رأي"))).toBe(false);
  });

  it("hides image and quote articles and keeps everything else", () => {
    const filter = excludeVisualColumnsFilter([IMAGE_ID, QUOTE_ID]);
    expect(matchesFilter(IMAGE_ID, filter)).toBe(false);
    expect(matchesFilter(QUOTE_ID, filter)).toBe(false);
    expect(matchesFilter(null, filter)).toBe(true);
    expect(matchesFilter("85ff3050-0d5c-4fdf-b360-0592d4dbb1c0", filter)).toBe(true);
    expect(matchesFilter("ef383998-3f4d-46bc-b137-0bfdf552664c", filter)).toBe(true);
  });

  it("keeps the whole list when no visual column exists", () => {
    const filter = excludeVisualColumnsFilter([]);
    expect(filter).toBeNull();
    expect(matchesFilter(IMAGE_ID, filter)).toBe(true);
    expect(matchesFilter(null, filter)).toBe(true);
  });
});
