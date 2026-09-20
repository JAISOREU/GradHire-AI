import { Fragment, type ReactNode } from 'react';

export const renderInline = (text: string, keyBase: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code key={`${keyBase}-code-${i}`} className="rounded bg-surface-muted px-1 py-0.5 text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
      return;
    }
    part.split(/(\*\*[^*]+\*\*)/g).forEach((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
        nodes.push(<strong key={`${keyBase}-bold-${i}-${j}`}>{seg.slice(2, -2)}</strong>);
        return;
      }
      nodes.push(<Fragment key={`${keyBase}-txt-${i}-${j}`}>{seg}</Fragment>);
    });
  });
  return nodes;
};

export const renderMarkdown = (text: string): ReactNode[] => {
  const blocks: ReactNode[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  let blockKey = 0;
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      const key = blockKey++;
      blocks.push(
        <p key={`p-${key}`} className="my-1.5">
          {renderInline(paragraph.join(' '), `p-${key}`)}
        </p>
      );
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const key = blockKey++;
      blocks.push(
        <ul key={`ul-${key}`} className="my-1.5 pl-4 list-disc">
          {listItems.map((item, idx) => (
            <li key={`li-${key}-${idx}`} className="text-sm">
              {renderInline(item, `li-${key}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      flushParagraph();
      flushList();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre key={`pre-${blockKey++}`} className="my-1.5 overflow-x-auto rounded bg-surface-muted p-2.5 text-xs font-mono whitespace-pre-wrap">
          {code.join('\n')}
        </pre>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      flushParagraph();
      listItems.push(line.trim().replace(/^[-*]\s+/, ''));
      i += 1;
      continue;
    }

    flushList();

    if (line.trim() === '') {
      flushParagraph();
    } else {
      paragraph.push(line.trim());
    }
    i += 1;
  }
  flushParagraph();
  flushList();

  return blocks;
};