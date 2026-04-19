/**
 * Minimal Portable Text blocks for @portabletext/react from plain paragraphs.
 * @param {string} text
 * @returns {Record<string, unknown>[]}
 */
export function blocksFromPlainText(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para, i) => ({
      _type: "block",
      _key: `blk-${i}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `span-${i}`,
          text: para.replace(/\n/g, " "),
          marks: [],
        },
      ],
    }));
}
