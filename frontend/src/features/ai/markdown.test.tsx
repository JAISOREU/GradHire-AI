import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { renderMarkdown } from './markdown';

afterEach(cleanup);

const renderMd = (text: string) => render(<div>{renderMarkdown(text)}</div>);

describe('renderMarkdown', () => {
  it('renders plain text as a paragraph', () => {
    renderMd('Hello world');
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bold text with ** markers', () => {
    renderMd('Make **this** bold');
    expect(screen.getByText('this', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders inline code with backticks', () => {
    renderMd('Use `npm run dev`');
    expect(screen.getByText('npm run dev', { selector: 'code' })).toBeInTheDocument();
  });

  it('renders a bulleted list', () => {
    renderMd('- First item\n- Second item');
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders a fenced code block', () => {
    renderMd('```ts\nconst x = 1;\n```');
    expect(screen.getByText('const x = 1;', { selector: 'pre' })).toBeInTheDocument();
  });

  it('splits paragraphs on blank lines', () => {
    renderMd('Line one.\n\nLine two.');
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(screen.getByText(/Line two/)).toBeInTheDocument();
  });
});