export interface RichTextRun {
  text: string;
  bold: boolean;
}

const BLOCK_TAG_NAMES = new Set(['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const VOID_TAG_NAMES = new Set(['br', 'img', 'hr', 'input', 'meta', 'link']);

const getTagName = (token: string): string | null => {
  const match = token.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
  return match ? match[1].toLowerCase() : null;
};

// A tag counts as "bold" whether it's a semantic <strong>/<b> (with or
// without attributes) or a rich-text-editor-style inline span carrying
// font-weight via a style attribute (e.g. <span style="font-weight:700">).
const isBoldTag = (token: string, tagName: string): boolean => {
  if (tagName === 'strong' || tagName === 'b') return true;
  const styleMatch = token.match(/style\s*=\s*["']([^"']*)["']/i);
  if (!styleMatch) return false;
  const fontWeightMatch = styleMatch[1].match(/font-weight\s*:\s*([a-z0-9]+)/i);
  if (!fontWeightMatch) return false;
  const value = fontWeightMatch[1].toLowerCase();
  if (value === 'bold' || value === 'bolder') return true;
  const numeric = parseInt(value, 10);
  return !Number.isNaN(numeric) && numeric >= 600;
};

const decodeEntities = (text: string): string =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, '\'')
    .replace(/[ ]{2,}/g, ' ');

// Parses simple CMS-authored HTML (paragraphs, line breaks, bold) into a list
// of paragraph "blocks", each a list of text runs carrying a bold flag —
// enough to render as nested <Text> elements without pulling in a full HTML
// renderer. Any tag that isn't a block boundary or a bold marker is dropped
// (its content is kept, just unstyled).
export const parseHtmlToRichText = (html: string): RichTextRun[][] => {
  const normalized = html.replace(/\s+/g, ' ');
  const tokens = normalized.split(/(<[^>]+>)/g).filter(Boolean);

  const blocks: RichTextRun[][] = [];
  let currentBlock: RichTextRun[] = [];
  let boldDepth = 0;
  // Tracks open (non-void) elements so a closing tag only decrements
  // boldDepth if the element it's closing actually opened bold formatting —
  // needed because style-based bold (e.g. <span style="font-weight:bold">)
  // closes via a plain </span> that carries no attributes of its own.
  const openStack: { bold: boolean }[] = [];

  const pushBlock = () => {
    if (currentBlock.length === 0) return;
    currentBlock[0] = { ...currentBlock[0], text: currentBlock[0].text.replace(/^\s+/, '') };
    const lastIndex = currentBlock.length - 1;
    currentBlock[lastIndex] = { ...currentBlock[lastIndex], text: currentBlock[lastIndex].text.replace(/\s+$/, '') };
    if (currentBlock.some(run => run.text.length > 0)) {
      blocks.push(currentBlock);
    }
    currentBlock = [];
  };

  tokens.forEach(token => {
    if (token.startsWith('<')) {
      const tagName = getTagName(token);
      if (!tagName) return;
      const isClosing = token.startsWith('</');
      const isSelfClosing = token.endsWith('/>');

      if (tagName === 'br') {
        pushBlock();
        return;
      }
      if (VOID_TAG_NAMES.has(tagName)) return;

      if (isClosing) {
        if (BLOCK_TAG_NAMES.has(tagName)) pushBlock();
        const closed = openStack.pop();
        if (closed?.bold) boldDepth = Math.max(0, boldDepth - 1);
        return;
      }

      const bold = isBoldTag(token, tagName);
      if (bold) boldDepth += 1;
      if (!isSelfClosing) openStack.push({ bold });
      return;
    }
    const text = decodeEntities(token);
    if (text.length === 0) return;
    currentBlock.push({ text, bold: boldDepth > 0 });
  });
  pushBlock();

  return blocks;
};
