import { ChangeEvent, useRef, useState } from 'react';
import { resumesApi } from '../../core/api/endpoints/resumes';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import type { Resume, ResumeParseResult } from '../../core/types';

const SUGGESTION_LINKS: Record<string, string> = {
  phone: '/student/account#section-personal',
  location: '/student/account#section-personal',
  education: '/student/account#section-education',
  experience: '/student/account#section-experience',
  summary: '/student/account#section-about',
  skills: '/student/account#section-skills',
};

const SUGGESTION_LABELS: Record<string, string> = {
  phone: 'Phone number',
  location: 'Location',
  education: 'Education',
  experience: 'Experience',
  summary: 'Professional summary',
  skills: 'Skills',
};

const isMissing = (value?: string | null) => !value || value.trim() === '';

const buildSuggestions = (parseResult: ResumeParseResult) => {
  const { profile, parsed } = parseResult;
  const suggestions: Array<{ key: string; label: string; href: string }> = [];

  if (parsed.phone && isMissing(profile.phone)) {
    suggestions.push({ key: 'phone', label: SUGGESTION_LABELS.phone, href: SUGGESTION_LINKS.phone });
  }
  if (parsed.address && isMissing(profile.location)) {
    suggestions.push({ key: 'location', label: SUGGESTION_LABELS.location, href: SUGGESTION_LINKS.location });
  }
  if (parsed.education && isMissing(profile.education)) {
    suggestions.push({ key: 'education', label: SUGGESTION_LABELS.education, href: SUGGESTION_LINKS.education });
  }
  if (parsed.experience && isMissing(profile.experience)) {
    suggestions.push({ key: 'experience', label: SUGGESTION_LABELS.experience, href: SUGGESTION_LINKS.experience });
  }
  if (parsed.summary && isMissing(profile.summary)) {
    suggestions.push({ key: 'summary', label: SUGGESTION_LABELS.summary, href: SUGGESTION_LINKS.summary });
  }
  if (parsed.skills.length > 0 && (!profile.skills || profile.skills.length === 0)) {
    suggestions.push({ key: 'skills', label: SUGGESTION_LABELS.skills, href: SUGGESTION_LINKS.skills });
  }

  return suggestions;
};

const RESUME_SECTIONS = [
  { key: 'phone', has: (p: ResumeParseResult['profile']) => Boolean(p.phone && p.phone.trim()) },
  { key: 'location', has: (p: ResumeParseResult['profile']) => Boolean(p.location && p.location.trim()) },
  { key: 'education', has: (p: ResumeParseResult['profile']) => Boolean(p.education && p.education.trim()) },
  { key: 'experience', has: (p: ResumeParseResult['profile']) => Boolean(p.experience && p.experience.trim()) },
  { key: 'summary', has: (p: ResumeParseResult['profile']) => Boolean(p.summary && p.summary.trim()) },
  { key: 'skills', has: (p: ResumeParseResult['profile']) => Boolean(p.skills && p.skills.length > 0) },
];

const ResumeIntelligencePanel = ({ parse }: { parse: ResumeParseResult }) => {
  const filled = RESUME_SECTIONS.filter((section) => section.has(parse.profile)).length;
  const strength = Math.round((filled / RESUME_SECTIONS.length) * 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="resume-intelligence section--mt">
      <div className="resume-intelligence__ring" aria-label={`Resume strength ${strength}%`}>
        <svg viewBox="0 0 100 100" className="resume-intelligence__svg">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (strength / 100) * circumference}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="resume-intelligence__number">{strength}%</div>
      </div>
      <div className="resume-intelligence__body">
        <div className="resume-intelligence__header">
          <span className="match-result-card__tag"><PhosphorIcon name="Sparkle" size={11} weight="fill" /> AI-powered</span>
          <span className="resume-intelligence__title">Resume Intelligence</span>
        </div>
        <p className="text-muted text-sm">Profile sections auto-filled from &quot;{parse.resume.fileName}&quot; — keep this strength high to surface in more matches.</p>
        <div className="resume-intelligence__metrics">
          <div className="resume-intelligence__metric">
            <strong>{parse.parsed.skills.length}</strong>
            <span>Skills extracted</span>
          </div>
          <div className="resume-intelligence__metric">
            <strong>{RESUME_SECTIONS.length - filled}</strong>
            <span>Gaps identified</span>
          </div>
          <div className="resume-intelligence__metric">
            <strong>{RESUME_SECTIONS.length}</strong>
            <span>Sections checked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentResumePage = () => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastParse, setLastParse] = useState<ResumeParseResult | null>(null);
  const { data: resumes, loading, reload } = useAsync(() => resumesApi.listMine(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = lastParse ? buildSuggestions(lastParse) : [];

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setMessage('Please choose a file.');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setMessage('Invalid file type. Please upload PDF, DOCX, or TXT.');
      return;
    }

    if (file.size > maxSize) {
      setMessage('File is too large. Maximum size is 5 MB.');
      return;
    }

    setUploading(true);
    setMessage('Uploading and parsing your resume…');
    try {
      const result = await resumesApi.upload(file);
      setLastParse(result);
      setMessage(`Resume parsed! Profile updated for ${result.profile.name}.`);
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Resume upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleReplace = async (resume: Resume) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setMessage('Invalid file type. Please upload PDF, DOCX, or TXT.');
        return;
      }

      if (file.size > maxSize) {
        setMessage('File is too large. Maximum size is 5 MB.');
        return;
      }

      setUploading(true);
      setMessage('Replacing resume…');
      try {
        const result = await resumesApi.replace(resume.id, file);
        setLastParse(result);
        setMessage(`Resume replaced! Profile updated for ${result.profile.name}.`);
        reload();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Resume replacement failed.');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleView = (id: string) => {
    const url = resumesApi.view(id);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (id: string) => {
    const url = resumesApi.download(id);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await resumesApi.delete(id);
      if (lastParse?.resume.id === id) setLastParse(null);
      setMessage('Resume deleted.');
      reload();
    } catch {
      setMessage('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Resume" subtitle="Upload your resume to auto-fill your profile and refresh your matches." />

      <div className="form-container">
        <Card title="Upload resume">
          <div className="stack">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              Upload &amp; parse
            </Button>
            {uploading && <div className="loading-state"><span className="spinner" aria-hidden="true" /><span>Parsing…</span></div>}
            {message && <div className={`message ${message.includes('Failed') || message.includes('Unable') ? 'message--error' : 'message--success'}`}>{message}</div>}
          </div>
        </Card>
      </div>

      {lastParse && (
        <>
          <ResumeIntelligencePanel parse={lastParse} />
          <div className="section--mt">
            <Card title={`Extracted from ${lastParse.resume.fileName}`}>
            <div className="stack">
              <div className="grid grid--2">
                <div>
                  <strong>Name:</strong> {lastParse.profile.name}
                </div>
                <div>
                  <strong>Focus:</strong> {lastParse.profile.focus}
                </div>
              </div>
              {lastParse.profile.summary && (
                <div>
                  <strong>Summary:</strong> {lastParse.profile.summary}
                </div>
              )}
              {lastParse.profile.skills && lastParse.profile.skills.length > 0 && (
                <div>
                  <strong>Skills:</strong> {lastParse.profile.skills.join(', ')}
                </div>
              )}
              <div className="text-muted">
                <small>Profile auto-updated with extracted information.</small>
              </div>
            </div>
          </Card>
          </div>
        </>
      )}

      {suggestions.length > 0 && (
        <div className="section--mt">
          <Card title="Suggested profile additions">
            <div className="stack">
              <p className="text-muted">Based on your resume, consider adding these details to strengthen your profile:</p>
              <ul className="list">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.key} className="list-item">
                    <div className="list-item__head">
                      <div>
                        <h3 className="list-item__title">{suggestion.label}</h3>
                      </div>
                      <Button variant="ghost" size="sm" to={suggestion.href}>
                        Add
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}

      <div className="section--mt">
        <h2 className="section-title">Your resumes</h2>
        {loading ? (
          <Skeleton variant="table" lines={3} />
        ) : resumes && resumes.length > 0 ? (
          <div className="list">
            {resumes.map((resume) => (
              <div key={resume.id} className="list-item">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{resume.fileName}</h3>
                    <div className="list-item__meta">
                      <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                      <span className="text-muted"> • {formatSize(resume.fileSize)}</span>
                      {resume.mimeType && <span className="badge">{resume.mimeType}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 resume-actions">
                    <Button variant="ghost" size="sm" onClick={() => handleView(resume.id)}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(resume.id)}>Download</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleReplace(resume)} disabled={uploading}>Replace</Button>
                    <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(resume.id)} disabled={deletingId === resume.id}>
                      {deletingId === resume.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="FileText" title="No resume on file" text="Upload a resume to get started." />
        )}
      </div>
    </div>
  );
};
