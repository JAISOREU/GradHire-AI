import { useRef, useState } from 'react';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { FeedAuthor } from '../types';

interface CreatePostComposerProps {
  author: FeedAuthor;
  onCreatePost: (input: { content: string; image?: string }) => void;
}

const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? 'there';

export const CreatePostComposer = ({ author, onCreatePost }: CreatePostComposerProps) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const canPost = content.trim().length > 0 || Boolean(image);

  const pickImage = () => fileRef.current?.click();

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!canPost) return;
    onCreatePost({ content: content.trim(), image });
    setContent('');
    setImage(undefined);
  };

  const actions: { label: string; icon: Parameters<typeof PhosphorIcon>[0]['name']; onClick?: () => void }[] = [
    { label: 'Photo', icon: 'Image', onClick: pickImage },
    { label: 'Video', icon: 'VideoCamera' },
    { label: 'Document', icon: 'FileText' },
    { label: 'Poll', icon: 'ChartBar' },
  ];

  return (
    <section className="feed-card feed-composer">
      <div className="feed-composer__row">
        <Avatar src={author.avatar} name={author.name} size="md" />
        <div className="feed-composer__fields">
          <textarea
            rows={2}
            className="feed-composer__input"
            placeholder={`What's on your mind, ${firstName(author.name)}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="feed-composer__hint">Share an update, ask a question, or post something related to your career.</p>
        </div>
      </div>

      {image && (
        <div className="feed-composer__preview">
          <img src={image} alt="Attachment preview" />
          <button type="button" className="feed-composer__preview-remove" aria-label="Remove attachment" onClick={() => setImage(undefined)}>
            <PhosphorIcon name="X" size={16} />
          </button>
        </div>
      )}

      <div className="feed-composer__footer">
        <div className="feed-composer__actions">
          {actions.map((a) => (
            <button key={a.label} type="button" className="feed-action" onClick={a.onClick}>
              <PhosphorIcon name={a.icon} size={18} />
              {a.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={submit} disabled={!canPost}>
          Post
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </section>
  );
};