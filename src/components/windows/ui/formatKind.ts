/**
 * Title-case an article `kind` for display ("research" → "Research").
 *
 * The Research index used to lean on a CSS `text-transform: capitalize` to show
 * the kind title-cased, while the article reader printed the raw lowercase
 * `kind` — an inconsistency. We now format the casing in ONE place, in JS, and
 * dropped the CSS `capitalize` (see `.os-pill` in globals.css) so the two can't
 * drift apart and nothing double-capitalizes.
 *
 * Mirrors CSS `capitalize` semantics — uppercases the first letter of each
 * whitespace-separated word — so the index's appearance is unchanged for the
 * current single-word kinds ("research"/"personal") and stays sensible if a
 * multi-word kind is ever added.
 */
export function formatKind(kind: string): string {
  return kind.replace(/\b\w/g, (c) => c.toUpperCase())
}
