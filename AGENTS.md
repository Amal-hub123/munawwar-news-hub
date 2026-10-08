# Project decisions

- Apply the shared internal-page canvas at the document and top-level page shells, excluding shells containing the editorial homepage; transparent services sections expose this canvas without altering cards, reader-selected backgrounds, or homepage artwork.

- Keep archive card styling opt-in through ArticleCard's archive variant; shared heading CSS targets public page and section titles, excluding card titles, editor content, and admin/writer management screens to preserve hierarchy.

- Anchor hero decorative circles to the article artwork with percentage-based positions and square aspect ratios; this preserves the same composition across screen sizes.

- Keep the three core services as presentation content in the public Services page; database services remain the independently managed “خدمات أخرى” list, preserving the existing editorial workflow.
- Article and service detail pages share the scoped `.article-editorial` layout: a right-hand portrait cover beside a left-hand reading column on large screens, and image-first stacking below 1024px; this keeps both reading surfaces consistent with the editorial reference without changing their content or controls.
- ProductDetail uses a shared article gallery only for the image and quote columns, normalizing Arabic diacritics when matching their names; other columns retain their existing article lists and all content stays in the existing article workflow.