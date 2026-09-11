import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BentoGrid, BentoItem } from './BentoGrid';

describe('BentoGrid', () => {
  it('renders children in a grid', () => {
    render(
      <BentoGrid columns={2}>
        <BentoItem>First</BentoItem>
        <BentoItem>Second</BentoItem>
      </BentoGrid>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('applies column span', () => {
    const { container } = render(
      <BentoGrid columns={4}>
        <BentoItem span={2}>Wide</BentoItem>
        <BentoItem>Narrow</BentoItem>
      </BentoGrid>
    );
    const items = container.querySelectorAll('[data-bento-item]');
    expect(items[0].className).toContain('col-span-2');
  });
});
