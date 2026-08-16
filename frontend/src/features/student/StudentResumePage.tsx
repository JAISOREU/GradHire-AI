import { ChangeEvent, useRef, useState } from 'react';
import { resumesApi } from '../../core/api/endpoints/resumes';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';

export const StudentResumePage = () => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: resumes, loading, reload } = useAsync(() => resumesApi.listMine(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setMessage('Please choose a file.');
      return;
    }
    setUploading(true);
    setMessage('Uploading and parsing your resume…');
    try {
      const result = await resumesApi.upload(file);
      setMessage(`Resume parsed! Profile updated for ${result.profile.name}.`);
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Resume upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleView = async (id: string) => {
    try {
      const resume = await resumesApi.getById(id);
      if (resume.fileUrl) {
        window.open(resume.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setMessage('Unable to open resume. Please try again.');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const resume = await resumesApi.getById(id);
      if (resume.fileUrl) {
        const a = document.createElement('a');
        a.href = resume.fileUrl;
        a.download = resume.fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      setMessage('Unable to download resume. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await resumesApi.delete(id);
      setMessage('Resume deleted.');
      reload();
    } catch {
      setMessage('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
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
              accept=".pdf,.doc,.docx,.txt"
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
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(resume.id)}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(resume.id)}>Download</Button>
                    <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(resume.id)} disabled={deletingId === resume.id}>
                      {deletingId === resume.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📄" title="No resume on file" text="Upload a resume to get started." />
        )}
      </div>
    </div>
  );
};
