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

  const triggerUpload = () => {
    fileInputRef.current?.click();
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
            <Button variant="secondary" onClick={triggerUpload} disabled={uploading}>
              Upload &amp; parse
            </Button>
            {uploading && <div className="loading-state"><span className="spinner" aria-hidden="true" /><span>Parsing…</span></div>}
            {message && <div className="message message--info">{message}</div>}
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
