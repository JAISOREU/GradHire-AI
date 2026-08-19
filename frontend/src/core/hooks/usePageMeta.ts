import { useEffect } from 'react';

type PageMeta = {
  title?: string;
  description?: string;
  path?: string;
};

export const usePageMeta = ({ title, description, path }: PageMeta) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (!description) return;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [title, description, path]);
};
