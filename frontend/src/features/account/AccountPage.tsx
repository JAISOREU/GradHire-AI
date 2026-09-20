import { Alert } from '../../components/Alert';
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi, usersApi } from '../../core/api/endpoints/students';
import { resumesApi } from '../../core/api/endpoints/resumes';
import { employersApi } from '../../core/api/endpoints/employers';
import { Link } from 'react-router-dom';
import { getRoleLabel } from '../../core/utils/roleLabels';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea, FormSelect } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { ImageCropDialog } from '../../components/ImageCropDialog';
import { EmptyState } from '../../components/EmptyState';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import type { PhosphorIconName } from '../../components/PhosphorIcon';
import { bumpProfileMediaVersion } from '../../lib/profileMediaVersion';
import type { UserRole, Education, Experience, Skill, CareerPreference, ProfileCompleteness, AiReadiness, Resume, Certification } from '../../core/types';

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', description: 'Your profile is visible to everyone.' },
  { value: 'EMPLOYERS_ONLY', label: 'Employers only', description: 'Verified employers can find you, but your profile is not publicly searchable.' },
  { value: 'PRIVATE', label: 'Private', description: 'Your profile is only visible to you.' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: '2_WEEKS', label: '2 weeks notice' },
  { value: '1_MONTH', label: '1 month notice' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
  { value: 'TEMPORARY', label: 'Temporary' },
];

const SKILL_LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
];

function ProfileCompleteness({ completeness, onSectionClick }: { completeness: ProfileCompleteness | null; onSectionClick?: (section: string) => void }) {
  if (!completeness) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-secondary">Profile completeness</span>
        <span className="text-sm font-semibold text-primary">{completeness.percentage}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${completeness.percentage}%` }} />
      </div>
      {completeness.missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-tertiary mb-2">Almost there! Add these sections to strengthen your profile:</p>
          <div className="flex flex-wrap gap-2">
            {completeness.missing.map((item) => (
              <button key={item} onClick={() => onSectionClick?.(item)} className="text-xs px-2 py-1 rounded-full bg-muted text-secondary hover:bg-primary hover:text-white transition-colors capitalize">
                {item.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AiReadiness({ readiness, onSectionClick }: { readiness: AiReadiness | null; onSectionClick?: (section: string) => void }) {
  if (!readiness) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-secondary">Smart Matching Readiness</span>
        <Badge kind={readiness.ready ? 'open' : 'hiring'}>{readiness.ready ? 'Ready' : 'Incomplete'}</Badge>
      </div>
      <div className="space-y-2">
        {readiness.checks.map((check) => (
          <div key={check.key} className="flex items-center justify-between text-sm">
            <span className={check.ready ? 'text-primary' : 'text-tertiary'}>{check.key}</span>
            <span className={check.ready ? 'text-primary' : 'text-tertiary'}>
              <PhosphorIcon name={check.ready ? 'CheckCircle' : 'Circle'} size={16} weight={check.ready ? 'fill' : 'regular'} />
            </span>
          </div>
        ))}
      </div>
      {!readiness.ready && (
        <div className="mt-3">
          <p className="text-xs text-tertiary mb-2">Tell us what you're looking for to unlock personalized recommendations:</p>
          <div className="flex flex-wrap gap-2">
            {readiness.missing.map((item) => (
              <button key={item} onClick={() => onSectionClick?.(item)} className="text-xs px-2 py-1 rounded-full bg-muted text-secondary hover:bg-primary hover:text-white transition-colors capitalize">
                {item.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, onEdit, editing, onSave, onCancel, saving }: { title: string; subtitle?: string; onEdit?: () => void; editing: boolean; onSave?: () => void; onCancel?: () => void; saving?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      <div className="flex gap-2">
        {editing ? (
          <>
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
            <Button size="sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        )}
      </div>
    </div>
  );
}

function PersonalInfoSection({ profile, onUpdate }: { profile: Record<string, unknown>; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', website: '', linkedin: '', github: '', portfolio: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        name: (profile.name as string) || '',
        phone: (profile.phone as string) || '',
        location: (profile.location as string) || '',
        website: (profile.website as string) || '',
        linkedin: (profile.linkedin as string) || '',
        github: (profile.github as string) || '',
        portfolio: (profile.portfolio as string) || '',
      });
    }
  }, [editing, profile]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await studentsApi.updateProfile(form);
      setMessage('Saved successfully');
      onUpdate();
      setEditing(false);
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Personal information" subtitle="Your basic contact details." className="section--mt" id="section-personal">
      {editing ? (
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <FormInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
          <FormInput label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <FormInput label="LinkedIn" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
          <FormInput label="GitHub" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
          <div className="col-span-2">
            <FormInput label="Portfolio" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} />
          </div>
          {message && <div className={`col-span-2 message ${message.includes('Failed') ? 'message--error' : 'message--success'}`}>{message}</div>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Full name</label><div className="text-sm font-medium">{(profile.name as string) || 'Not set'}</div></div>
          <div><label className="form-label">Phone</label><div className="text-sm font-medium">{(profile.phone as string) || 'Not set'}</div></div>
          <div><label className="form-label">Location</label><div className="text-sm font-medium">{(profile.location as string) || 'Not set'}</div></div>
          <div><label className="form-label">Website</label><div className="text-sm font-medium">{(profile.website as string) || 'Not set'}</div></div>
          <div><label className="form-label">LinkedIn</label><div className="text-sm font-medium">{(profile.linkedin as string) || 'Not set'}</div></div>
          <div><label className="form-label">GitHub</label><div className="text-sm font-medium">{(profile.github as string) || 'Not set'}</div></div>
          <div className="col-span-2"><label className="form-label">Portfolio</label><div className="text-sm font-medium">{(profile.portfolio as string) || 'Not set'}</div></div>
        </div>
      )}
      <SectionHeader title="" subtitle="" editing={editing} onEdit={() => setEditing(true)} onSave={save} onCancel={() => setEditing(false)} saving={saving} />
    </Card>
  );
}

function HeadlineSection({ profile, onUpdate }: { profile: Record<string, unknown>; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (editing) setFocus((profile.focus as string) || ''); }, [editing, profile]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await studentsApi.updateProfile({ focus });
      setMessage('Saved successfully');
      onUpdate();
      setEditing(false);
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Professional headline" subtitle="A short statement about your career focus." className="section--mt" id="section-headline">
      {editing ? (
        <div>
          <FormTextarea label="Headline" value={focus} onChange={(e) => setFocus(e.target.value)} rows={2} />
          {message && <div className={`message ${message.includes('Failed') ? 'message--error' : 'message--success'}`}>{message}</div>}
        </div>
      ) : (
        <p className="text-sm text-secondary">{(profile.focus as string) || 'Not set'}</p>
      )}
      <SectionHeader title="" subtitle="" editing={editing} onEdit={() => setEditing(true)} onSave={save} onCancel={() => setEditing(false)} saving={saving} />
    </Card>
  );
}

function AboutSection({ profile, onUpdate }: { profile: Record<string, unknown>; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (editing) setSummary((profile.summary as string) || ''); }, [editing, profile]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await studentsApi.updateProfile({ summary });
      setMessage('Saved successfully');
      onUpdate();
      setEditing(false);
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="About" subtitle="Tell employers about yourself." className="section--mt" id="section-about">
      {editing ? (
        <div>
          <FormTextarea label="About" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
          {message && <div className={`message ${message.includes('Failed') ? 'message--error' : 'message--success'}`}>{message}</div>}
        </div>
      ) : (
        <p className="text-sm text-secondary">{(profile.summary as string) || 'Not provided'}</p>
      )}
      <SectionHeader title="" subtitle="" editing={editing} onEdit={() => setEditing(true)} onSave={save} onCancel={() => setEditing(false)} saving={saving} />
    </Card>
  );
}

function EducationSection({ userId: _userId, onSectionClick }: { userId: string; onSectionClick?: (section: string) => void }) {
  const [items, setItems] = useState<Education[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', currentlyStudying: false, description: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getEducations();
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (onSectionClick && editing === null && items.length === 0) {
      setEditing('new');
    }
  }, [onSectionClick, editing, items.length]);

  const startEdit = (item?: Education) => {
    if (item) {
      setForm({ institution: item.institution, degree: item.degree || '', fieldOfStudy: item.fieldOfStudy || '', startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '', currentlyStudying: item.currentlyStudying, description: item.description || '' });
      setEditing(item.id);
    } else {
      setForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', currentlyStudying: false, description: '' });
      setEditing('new');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await studentsApi.createEducation(form);
      } else if (editing) {
        await studentsApi.updateEducation(editing, form);
      }
      setEditing(null);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await studentsApi.deleteEducation(id);
    reload();
  };

  return (
    <Card title="Education" subtitle="Add your academic background." className="section--mt" id="section-education">
      {loading ? <Skeleton variant="table" lines={3} /> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium text-sm">{item.institution}</div>
                <div className="text-xs text-secondary">{item.degree} {item.fieldOfStudy ? `· ${item.fieldOfStudy}` : ''}</div>
                <div className="text-xs text-tertiary mt-1">{new Date(item.startDate).getFullYear()} – {item.currentlyStudying ? 'Present' : (item.endDate ? new Date(item.endDate).getFullYear() : 'Present')}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-danger" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <EmptyState icon="GraduationCap" title="No education added" text="Add your first education entry." />}
        </div>
      )}
      {editing ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <FormInput label="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required />
          <FormInput label="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          <FormInput label="Field of Study" value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} />
          <FormInput label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <FormInput label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.currentlyStudying} />
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="currentlyStudying" checked={form.currentlyStudying} onChange={(e) => setForm({ ...form, currentlyStudying: e.target.checked })} />
            <label htmlFor="currentlyStudying" className="text-sm">Currently studying</label>
          </div>
          <div className="col-span-2">
            <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => startEdit()}>+ Add Education</Button>
        </div>
      )}
    </Card>
  );
}

function ExperienceSection({ userId: _userId, onSectionClick }: { userId: string; onSectionClick?: (section: string) => void }) {
  const [items, setItems] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ jobTitle: string; company: string; employmentType: string; location: string; startDate: string; endDate: string; currentlyWorking: boolean; description: string; skillsUsed: string[] }>({ jobTitle: '', company: '', employmentType: '', location: '', startDate: '', endDate: '', currentlyWorking: false, description: '', skillsUsed: [] });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getExperiences();
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (onSectionClick && editing === null && items.length === 0) {
      setEditing('new');
    }
  }, [onSectionClick, editing, items.length]);

  const startEdit = (item?: Experience) => {
    if (item) {
      setForm({ jobTitle: item.jobTitle, company: item.company, employmentType: item.employmentType || '', location: item.location || '', startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '', currentlyWorking: item.currentlyWorking, description: item.description || '', skillsUsed: item.skillsUsed });
      setEditing(item.id);
    } else {
      setForm({ jobTitle: '', company: '', employmentType: '', location: '', startDate: '', endDate: '', currentlyWorking: false, description: '', skillsUsed: [] });
      setEditing('new');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await studentsApi.createExperience(form);
      } else if (editing) {
        await studentsApi.updateExperience(editing, form);
      }
      setEditing(null);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await studentsApi.deleteExperience(id);
    reload();
  };

  return (
    <Card title="Experience" subtitle="Add your work history." className="section--mt" id="section-experience">
      {loading ? <Skeleton variant="table" lines={3} /> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium text-sm">{item.jobTitle} at {item.company}</div>
                <div className="text-xs text-secondary">{item.employmentType} {item.location ? `· ${item.location}` : ''}</div>
                <div className="text-xs text-tertiary mt-1">{new Date(item.startDate).getFullYear()} – {item.currentlyWorking ? 'Present' : (item.endDate ? new Date(item.endDate).getFullYear() : 'Present')}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-danger" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <EmptyState icon="Briefcase" title="No experience added" text="Add your first work experience." />}
        </div>
      )}
      {editing && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <FormInput label="Job Title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required />
          <FormInput label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <FormSelect label="Employment Type" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} options={EMPLOYMENT_TYPE_OPTIONS} />
          <FormInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <FormInput label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <FormInput label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.currentlyWorking} />
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="currentlyWorking" checked={form.currentlyWorking} onChange={(e) => setForm({ ...form, currentlyWorking: e.target.checked })} />
            <label htmlFor="currentlyWorking" className="text-sm">Currently working here</label>
          </div>
          <div className="col-span-2">
            <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      )}
      {!editing && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => startEdit()}>+ Add Experience</Button>
        </div>
      )}
    </Card>
  );
}

function SkillsSection({ userId: _userId, onSectionClick }: { userId: string; onSectionClick?: (section: string) => void }) {
  const [items, setItems] = useState<Skill[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [years, setYears] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getSkills();
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (onSectionClick && items.length === 0) {
      setName('');
      setCategory('');
      setLevel('BEGINNER');
      setYears('');
    }
  }, [onSectionClick, items.length]);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await studentsApi.createSkill({ name: name.trim(), category: category.trim() || undefined, level, yearsOfExperience: years ? Number(years) : undefined });
      setName('');
      setCategory('');
      setLevel('BEGINNER');
      setYears('');
      reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await studentsApi.deleteSkill(id);
    reload();
  };

  return (
    <Card title="Skills" subtitle="Add skills with proficiency levels." className="section--mt" id="section-skills">
      {loading ? <Skeleton variant="table" lines={3} /> : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <span key={skill.id} className="badge inline-flex items-center gap-2">
              {skill.name} {skill.level && <span className="text-xs opacity-75">({skill.level})</span>}
              <button onClick={() => remove(skill.id)} className="text-danger hover:underline text-xs">×</button>
            </span>
          ))}
          {items.length === 0 && <span className="text-sm text-tertiary">No skills added yet.</span>}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <FormInput label="Skill name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Python" />
        <FormInput label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Backend" />
        <FormSelect label="Proficiency" value={level} onChange={(e) => setLevel(e.target.value)} options={SKILL_LEVEL_OPTIONS} />
        <FormInput label="Years of Experience" type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="e.g. 3" />
        <div className="col-span-2">
          <Button variant="secondary" size="sm" onClick={add} disabled={saving || !name.trim()}>{saving ? 'Adding…' : '+ Add Skill'}</Button>
        </div>
      </div>
    </Card>
  );
}

function CertificationsSection(_props: { onSectionClick?: (section: string) => void }) {
  const [items, setItems] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', issuer: '', issuedAt: '', expiresAt: '', credentialId: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getCertifications();
      setItems(data as Certification[]);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const startEdit = (item?: Certification) => {
    if (item) {
      setForm({ name: item.name, issuer: item.issuer || '', issuedAt: item.issuedAt?.slice(0, 10) || '', expiresAt: item.expiresAt?.slice(0, 10) || '', credentialId: item.credentialId || '', url: item.url || '' });
      setEditing(item.id);
    } else {
      setForm({ name: '', issuer: '', issuedAt: '', expiresAt: '', credentialId: '', url: '' });
      setEditing('new');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await studentsApi.createCertification(form);
      } else if (editing) {
        await studentsApi.updateCertification(editing, form);
      }
      setEditing(null);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await studentsApi.deleteCertification(id);
    reload();
  };

  return (
    <Card title="Certifications" subtitle="Add professional certifications and licenses." className="section--mt" id="section-certifications">
      {loading ? <Skeleton variant="table" lines={3} /> : (
        <div className="space-y-3">
          {items.map((item: Certification) => (
            <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-secondary">{item.issuer} {item.issuedAt ? `· Issued ${new Date(item.issuedAt).getFullYear()}` : ''}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-danger" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <EmptyState icon="Trophy" title="No certifications added" text="Add professional certifications to strengthen your profile." />}
        </div>
      )}
      {editing && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <FormInput label="Certification Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
          <FormInput label="Issued Date" type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} />
          <FormInput label="Expires Date" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          <FormInput label="Credential ID" value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} />
          <FormInput label="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      )}
      {!editing && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => startEdit()}>+ Add Certification</Button>
        </div>
      )}
    </Card>
  );
}

function ProjectsSection(_props: { onSectionClick?: (section: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', url: '', startDate: '', endDate: '', skillsUsed: [] });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getProjects();
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const startEdit = (item?: any) => {
    if (item) {
      setForm({ name: item.name, description: item.description || '', url: item.url || '', startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '', skillsUsed: item.skillsUsed || [] });
      setEditing(item.id);
    } else {
      setForm({ name: '', description: '', url: '', startDate: '', endDate: '', skillsUsed: [] });
      setEditing('new');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await studentsApi.createProject(form);
      } else if (editing) {
        await studentsApi.updateProject(editing, form);
      }
      setEditing(null);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await studentsApi.deleteProject(id);
    reload();
  };

  return (
    <Card title="Projects" subtitle="Showcase your personal or academic projects." className="section--mt" id="section-projects">
      {loading ? <Skeleton variant="table" lines={3} /> : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-secondary">{item.description}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-danger" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <EmptyState icon="Rocket" title="No projects added" text="Add projects to demonstrate your skills." />}
        </div>
      )}
      {editing && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormInput label="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="col-span-2">
            <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <FormInput label="Project URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <FormInput label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <FormInput label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      )}
      {!editing && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => startEdit()}>+ Add Project</Button>
        </div>
      )}
    </Card>
  );
}

function CareerPreferencesSection({ onSectionClick }: { onSectionClick?: (section: string) => void }) {
  const [prefs, setPrefs] = useState<CareerPreference | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ preferredJobTitles: '', industries: '', preferredLocations: '', workArrangement: '', salaryExpectation: '', availability: '', workAuthorization: '', authorizedCountries: '', needsVisaSponsorship: false });
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await studentsApi.getCareerPreferences();
      setPrefs(data);
      if (data) {
        setForm({
          preferredJobTitles: Array.isArray(data.preferredJobTitles) ? data.preferredJobTitles.join(', ') : '',
          industries: Array.isArray(data.industries) ? data.industries.join(', ') : '',
          preferredLocations: Array.isArray(data.preferredLocations) ? data.preferredLocations.join(', ') : '',
          workArrangement: data.workArrangement || '',
          salaryExpectation: data.salaryExpectation || '',
          availability: data.availability || '',
          workAuthorization: data.workAuthorization || '',
          authorizedCountries: Array.isArray(data.authorizedCountries) ? data.authorizedCountries.join(', ') : '',
          needsVisaSponsorship: data.needsVisaSponsorship,
        });
      }
    } catch {
      setPrefs(null);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (onSectionClick && !prefs) {
      setEditing(true);
    }
  }, [onSectionClick, prefs]);

  const save = async () => {
    setSaving(true);
    try {
      await studentsApi.updateCareerPreferences({
        preferredJobTitles: form.preferredJobTitles.split(',').map((s) => s.trim()).filter(Boolean),
        industries: form.industries.split(',').map((s) => s.trim()).filter(Boolean),
        preferredLocations: form.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
        workArrangement: form.workArrangement || undefined,
        salaryExpectation: form.salaryExpectation || undefined,
        availability: form.availability || undefined,
        workAuthorization: form.workAuthorization || undefined,
        authorizedCountries: form.authorizedCountries.split(',').map((s) => s.trim()).filter(Boolean),
        needsVisaSponsorship: form.needsVisaSponsorship,
      });
      setEditing(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Career preferences" subtitle="Set your preferences and we'll surface personalized job recommendations that match your goals, location, and interests." className="section--mt" id="section-preferences">
      {editing ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormInput label="Preferred Job Titles" value={form.preferredJobTitles} onChange={(e) => setForm({ ...form, preferredJobTitles: e.target.value })} placeholder="Software Engineer, Product Manager" />
          </div>
          <div className="col-span-2">
            <FormInput label="Industries" value={form.industries} onChange={(e) => setForm({ ...form, industries: e.target.value })} placeholder="Technology, Finance, Healthcare" />
          </div>
          <div className="col-span-2">
            <FormInput label="Preferred Locations" value={form.preferredLocations} onChange={(e) => setForm({ ...form, preferredLocations: e.target.value })} placeholder="Manila, Remote, Singapore" />
          </div>
          <FormSelect label="Work Arrangement" value={form.workArrangement} onChange={(e) => setForm({ ...form, workArrangement: e.target.value })} options={EMPLOYMENT_TYPE_OPTIONS} />
          <FormInput label="Salary Expectation" value={form.salaryExpectation} onChange={(e) => setForm({ ...form, salaryExpectation: e.target.value })} placeholder="e.g. 50000–70000 PHP/month" />
          <FormSelect label="Availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} options={AVAILABILITY_OPTIONS} />
          <div className="col-span-2">
            <FormInput label="Authorized Countries" value={form.authorizedCountries} onChange={(e) => setForm({ ...form, authorizedCountries: e.target.value })} placeholder="Philippines, Singapore" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="needsVisaSponsorship" checked={form.needsVisaSponsorship} onChange={(e) => setForm({ ...form, needsVisaSponsorship: e.target.checked })} />
            <label htmlFor="needsVisaSponsorship" className="text-sm">I need visa sponsorship</label>
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Preferred Job Titles</label><div className="text-sm font-medium">{(prefs?.preferredJobTitles ?? []).join(', ') || 'Not set'}</div></div>
          <div><label className="form-label">Industries</label><div className="text-sm font-medium">{(prefs?.industries ?? []).join(', ') || 'Not set'}</div></div>
          <div><label className="form-label">Preferred Locations</label><div className="text-sm font-medium">{(prefs?.preferredLocations ?? []).join(', ') || 'Not set'}</div></div>
          <div><label className="form-label">Work Arrangement</label><div className="text-sm font-medium">{prefs?.workArrangement || 'Not set'}</div></div>
          <div><label className="form-label">Salary Expectation</label><div className="text-sm font-medium">{prefs?.salaryExpectation || 'Not set'}</div></div>
          <div><label className="form-label">Availability</label><div className="text-sm font-medium">{prefs?.availability || 'Not set'}</div></div>
          <div><label className="form-label">Work Authorization</label><div className="text-sm font-medium">{prefs?.workAuthorization || 'Not set'}</div></div>
          <div><label className="form-label">Authorized Countries</label><div className="text-sm font-medium">{(prefs?.authorizedCountries ?? []).join(', ') || 'Not set'}</div></div>
        </div>
      )}
      {!editing && (
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit preferences</Button>
        </div>
      )}
    </Card>
  );
}

function ProfileVisibilitySection({ profile, onUpdate }: { profile: Record<string, unknown>; onUpdate: () => void }) {
  const [visibility, setVisibility] = useState((profile.visibility as string) || 'EMPLOYERS_ONLY');
  const [saving, setSaving] = useState(false);

  const handleChange = async (value: string) => {
    setVisibility(value);
    setSaving(true);
    try {
      await studentsApi.updateProfile({ visibility: value });
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Profile visibility" subtitle="Control who can see your profile." className="section--mt" id="section-visibility">
      <div className="form-group">
        <label className="form-label" htmlFor="account-visibility">Visibility</label>
        <select id="account-visibility" value={visibility} onChange={(e) => handleChange(e.target.value)} disabled={saving} className="select">
          {VISIBILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="form-hint">
          {VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.description}
        </p>
      </div>
    </Card>
  );
}

function ResumeSection() {
  const { data: resumes, loading, reload } = useAsync<Resume[]>(() => resumesApi.listMine(), []);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleView = async (id: string) => {
    setError('');
    try {
      const resume = await resumesApi.getById(id);
      if (resume.fileUrl) {
        window.open(resume.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setError('Unable to open resume. Please try again.');
    }
  };

  const handleDownload = async (id: string) => {
    setError('');
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
      setError('Unable to download resume. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This action cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await resumesApi.delete(id);
      reload();
    } catch {
      setError('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card title="Resume" subtitle="Manage your uploaded resumes." className="section--mt">
      <div className="list">
        {loading ? (
          <Skeleton variant="table" lines={2} />
        ) : resumes && resumes.length > 0 ? (
          resumes.map((resume) => (
            <article key={resume.id} className="list-item">
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
            </article>
          ))
        ) : (
          <div className="text-sm text-secondary">No resumes uploaded yet.</div>
        )}
      </div>
      <div className="mt-4">
        <label className="btn btn--secondary btn--sm">
          Upload new resume
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const maxSize = 5 * 1024 * 1024;
                const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
                if (file.size > maxSize) {
                  setError('File size must be under 5 MB.');
                  return;
                }
                if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
                  setError('Invalid file type. Please upload PDF, DOCX, or TXT.');
                  return;
                }
                resumesApi.upload(file).then(() => reload());
              }
            }}
          />
        </label>
      </div>
      {error && <Alert className="section--mt">{error}</Alert>}
    </Card>
  );
}

function TalentAccountSettings({ onUpdate }: { onUpdate: () => void }) {
  const { data: settings, loading } = useAsync(() => studentsApi.getSettings(), []);
  const [form, setForm] = useState<Record<string, boolean | string | null>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await studentsApi.updateSettings(form as Record<string, unknown>);
      onUpdate();
      setMessage({ type: 'success', text: 'Preferences saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton variant="table" lines={4} />;

  const toggle = (key: string) => setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Card title="Notification settings" subtitle="Manage how you receive updates." className="section--mt">
      <div className="stack">
        {[
          { key: 'emailNotifications', label: 'Email notifications', description: 'Receive email updates about your account activity.' },
          { key: 'applicationAlerts', label: 'Application status updates', description: 'Get notified when your application status changes.' },
          { key: 'recommendationAlerts', label: 'New job recommendations', description: 'Receive alerts when new jobs match your profile.' },
          { key: 'messageAlerts', label: 'New messages', description: 'Get notified when you receive a new message.' },
          { key: 'interviewAlerts', label: 'Interview invitations', description: 'Get notified about interview scheduling.' },
          { key: 'weeklyDigest', label: 'Weekly digest', description: 'Receive a weekly summary of your activity.' },
        ].map((item) => (
          <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
            <input
              type="checkbox"
              checked={(form[item.key] as boolean) ?? false}
              onChange={() => toggle(item.key)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs text-tertiary">{item.description}</div>
            </div>
          </label>
        ))}
        {message && (
          <div className={`message ${message.type === 'success' ? 'message--success' : 'message--error'}`} role="alert">
            {message.text}
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</Button>
        </div>
      </div>
    </Card>
  );
}

function DangerZone() {
  const [confirm, setConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await usersApi.deleteAccount(password || undefined);
      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <Card title="Danger zone" className="section--mt">
      <p className="text-sm text-secondary mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      {confirm ? (
        <div className="stack">
          <FormInput
            label="Confirm password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
           {error && <Alert>{error}</Alert>}
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting || !password}>
              {deleting ? 'Deleting…' : 'Yes, delete my account'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setConfirm(false); setPassword(''); setError(''); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>Delete account</Button>
      )}
    </Card>
  );
}

/* ============================================================
   JobStreet-style profile shell
   ============================================================ */

type RailItem = {
  key: string;
  label: string;
  icon: PhosphorIconName;
  status?: 'incomplete' | 'complete' | 'neutral';
};

type AuthUserLite = {
  avatarUrl?: string;
  id?: string;
  name?: string;
  email?: string;
};

const STUDENT_RAIL: RailItem[] = [
  { key: 'overview', label: 'Overview', icon: 'SquaresFour' },
  { key: 'personal', label: 'Personal details', icon: 'IdentificationBadge' },
  { key: 'experience', label: 'Career history', icon: 'Briefcase' },
  { key: 'education', label: 'Education', icon: 'GraduationCap' },
  { key: 'skills', label: 'Skills', icon: 'Lightning' },
  { key: 'certifications', label: 'Licences & certifications', icon: 'Certificate' },
  { key: 'projects', label: 'Projects', icon: 'Rocket' },
  { key: 'resume', label: 'Resumé', icon: 'FileText' },
  { key: 'preferences', label: 'Career interests', icon: 'Target' },
  { key: 'visibility', label: 'Profile visibility', icon: 'Eye' },
  { key: 'notifications', label: 'Notification settings', icon: 'Bell' },
  { key: 'account', label: 'Account & security', icon: 'ShieldCheck' },
  { key: 'danger', label: 'Danger zone', icon: 'Warning' },
];

const EMPLOYER_RAIL: RailItem[] = [
  { key: 'overview', label: 'Overview', icon: 'SquaresFour' },
  { key: 'company', label: 'Company information', icon: 'Buildings' },
  { key: 'visibility', label: 'Company visibility', icon: 'Eye' },
  { key: 'hiring', label: 'Hiring preferences', icon: 'Target' },
  { key: 'account', label: 'Account & security', icon: 'ShieldCheck' },
  { key: 'danger', label: 'Danger zone', icon: 'Warning' },
];

const STUDENT_SECTION_LABELS: Record<string, string[]> = {
  personal: ['Personal Information', 'Phone', 'Location', 'Professional Headline', 'About'],
  experience: ['Experience'],
  education: ['Education'],
  skills: ['Skills'],
  resume: ['Resume'],
  preferences: ['Career Preferences'],
};

const MISSING_LABEL_TO_SECTION: Record<string, string> = {
  'Personal Information': 'personal',
  Phone: 'personal',
  Location: 'personal',
  'Professional Headline': 'personal',
  About: 'personal',
  Education: 'education',
  Experience: 'experience',
  Skills: 'skills',
  Resume: 'resume',
  'Career Preferences': 'preferences',
};

function railItemStatus(key: string, missing: string[]): RailItem['status'] {
  const labels = STUDENT_SECTION_LABELS[key];
  if (!labels) return 'neutral';
  return labels.some((label) => missing.includes(label)) ? 'incomplete' : 'complete';
}

function ProfileBanner({ role, profile, user, avatarError, bannerUrl, bannerError, mediaRefresh, onAvatarChange, onBannerChange }: {
  role: UserRole;
  profile: Record<string, unknown>;
  user: AuthUserLite | null;
  avatarError: string;
  bannerUrl: string | null;
  bannerError: string;
  mediaRefresh: number;
  onAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBannerChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const isEmployer = role === 'EMPLOYER';
  const hasBanner = Boolean(bannerUrl);
  const bannerSrc = bannerUrl
    ? bannerUrl.startsWith('http://') || bannerUrl.startsWith('https://') || bannerUrl.startsWith('data:')
      ? bannerUrl
      : user?.id
        ? `/api/v1/users/banner/${encodeURIComponent(user.id)}?v=${mediaRefresh}`
        : ''
    : '';
  const displayName = (profile.companyName as string) || (profile.name as string) || user?.name || 'User';
  const headline = isEmployer
    ? `${(profile.industry as string) || 'Company'} · ${(profile.location as string) || 'Location not set'}`
    : (profile.focus as string) || 'Tell employers what you want to be known for';

  return (
    <section
      className={hasBanner ? 'profile-banner profile-banner--image' : 'profile-banner'}
      aria-label="Profile banner"
      style={bannerSrc ? { backgroundImage: `linear-gradient(125deg, rgba(16, 10, 51, 0.62) 0%, rgba(56, 44, 160, 0.45) 100%), url("${bannerSrc}")` } : undefined}
    >
      <label className="profile-banner__edit" title="Change banner photo" aria-label="Change banner photo">
        <PhosphorIcon name="ImageSquare" size={18} weight="fill" />
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onBannerChange} />
      </label>
      <div className="profile-banner__content">
        <label className="avatar-upload profile-banner__avatar">
          <Avatar src={user?.avatarUrl} name={displayName} size="xl" userId={user?.id} />
          <span className="avatar-upload__overlay" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onAvatarChange} />
        </label>
        <div className="profile-banner__main">
          <div className="profile-banner__badges">
            <span className="profile-banner__pill"><PhosphorIcon name="ShieldCheck" size={14} weight="fill" />{getRoleLabel(role)}</span>
            {isEmployer && Boolean(profile.verified) && (
              <span className="profile-banner__pill"><PhosphorIcon name="CheckCircle" size={14} weight="fill" />Verified</span>
            )}
          </div>
          <h2 className="profile-banner__name">{displayName}</h2>
          {headline && <p className="profile-banner__headline">{headline}</p>}
          <div className="profile-banner__chips">
            {role === 'STUDENT' && (
              <>
                <span className="profile-banner__chip"><PhosphorIcon name="MapPin" size={15} />{(profile.location as string) || 'Location not set'}</span>
                <span className="profile-banner__chip"><PhosphorIcon name="EnvelopeSimple" size={15} />{user?.email || 'Email not set'}</span>
                <span className="profile-banner__chip"><PhosphorIcon name="Phone" size={15} />{(profile.phone as string) || 'Phone not set'}</span>
              </>
            )}
            {isEmployer && (
              <>
                <span className="profile-banner__chip"><PhosphorIcon name="EnvelopeSimple" size={15} />{user?.email || 'Email not set'}</span>
                <span className="profile-banner__chip"><PhosphorIcon name="MapPin" size={15} />{(profile.location as string) || 'Location not set'}</span>
                <span className="profile-banner__chip"><PhosphorIcon name="Buildings" size={15} />{(profile.industry as string) || 'Industry not set'}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {bannerError && <p className="profile-banner__error" role="alert">{bannerError}</p>}
      {avatarError && <p className="profile-banner__error" role="alert">{avatarError}</p>}
    </section>
  );
}

function ProfileStrength({ completeness, onJump }: { completeness: ProfileCompleteness; onJump: (section: string) => void }) {
  return (
    <section className="profile-strength" aria-label="Profile strength">
      <div className="profile-strength__head">
        <span className="profile-strength__label">Profile strength</span>
        <span className="profile-strength__value">{completeness.percentage}%</span>
      </div>
      <div className="profile-strength__track">
        <div className="profile-strength__fill" style={{ width: `${completeness.percentage}%` }} />
      </div>
      {completeness.missing.length > 0 && (
        <div className="profile-strength__pills">
          <span className="profile-strength__hint">Add these to strengthen your profile:</span>
          {completeness.missing.map((item) => (
            <button key={item} type="button" className="profile-strength__pill" onClick={() => onJump(MISSING_LABEL_TO_SECTION[item] || item)}>
              {item}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionRail({ items, active, onSelect }: { items: RailItem[]; active: string; onSelect: (key: string) => void }) {
  return (
    <nav className="profile-rail" aria-label="Profile sections">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={item.key === active ? 'profile-rail__item is-active' : 'profile-rail__item'}
          onClick={() => onSelect(item.key)}
          aria-current={item.key === active ? 'page' : undefined}
        >
          <span className="profile-rail__icon"><PhosphorIcon name={item.icon} size={18} /></span>
          <span className="profile-rail__label">{item.label}</span>
          {item.status === 'incomplete' && <span className="profile-rail__status is-missing" title="Incomplete" aria-label="Incomplete" />}
          {item.status === 'complete' && <span className="profile-rail__status is-complete" title="Complete" aria-label="Complete" />}
        </button>
      ))}
    </nav>
  );
}

function OverviewPanel({ profile, user, completeness, aiReadiness, onJump }: {
  profile: Record<string, unknown>;
  user: AuthUserLite | null;
  completeness: ProfileCompleteness | null;
  aiReadiness: AiReadiness | null;
  onJump: (section: string) => void;
}) {
  return (
    <>
      <Card title="Profile overview" subtitle="A snapshot of your professional identity." className="section--mt">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Full name</label><div className="text-sm font-medium">{(profile.name as string) || 'Not set'}</div></div>
          <div><label className="form-label">Email</label><div className="text-sm font-medium">{user?.email || 'Not set'}</div></div>
          <div><label className="form-label">Phone</label><div className="text-sm font-medium">{(profile.phone as string) || 'Not set'}</div></div>
          <div><label className="form-label">Location</label><div className="text-sm font-medium">{(profile.location as string) || 'Not set'}</div></div>
          <div className="col-span-2"><label className="form-label">Professional headline</label><div className="text-sm font-medium">{(profile.focus as string) || 'Not set'}</div></div>
        </div>
      </Card>
      <Card className="section--mt">
        <ProfileCompleteness completeness={completeness} onSectionClick={onJump} />
      </Card>
      <Card className="section--mt">
        <AiReadiness readiness={aiReadiness} onSectionClick={onJump} />
      </Card>
    </>
  );
}

function EmployerOverviewPanel({ profile }: { profile: Record<string, unknown> }) {
  return (
    <>
      <Card title="Company overview" subtitle="How your company appears to talent." className="section--mt">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Company name</label><div className="text-sm font-medium">{(profile.companyName as string) || 'Not set'}</div></div>
          <div><label className="form-label">Industry</label><div className="text-sm font-medium">{(profile.industry as string) || 'Not set'}</div></div>
          <div><label className="form-label">Location</label><div className="text-sm font-medium">{(profile.location as string) || 'Not set'}</div></div>
          <div><label className="form-label">Website</label><div className="text-sm font-medium">{(profile.website as string) || 'Not set'}</div></div>
          <div className="col-span-2"><label className="form-label">Description</label><p className="text-sm text-secondary">{(profile.description as string) || 'No description provided.'}</p></div>
          <div className="col-span-2"><label className="form-label">Verification</label><div className="text-sm font-medium">{Boolean(profile.verified) ? 'Verified employer' : 'Not verified'}</div></div>
        </div>
      </Card>
      <Card title="Hiring at a glance" subtitle="Preferred candidate and job criteria." className="section--mt">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Preferred experience</label><div className="text-sm text-secondary">Entry-level, Junior, Mid-level</div></div>
          <div><label className="form-label">Work arrangement</label><div className="text-sm text-secondary">Remote · Hybrid · On-site</div></div>
          <div><label className="form-label">Hiring locations</label><div className="text-sm text-secondary">Manila · Laguna · Remote</div></div>
          <div><label className="form-label">Employment types</label><div className="text-sm text-secondary">Full-time, Contract, Internship</div></div>
        </div>
      </Card>
    </>
  );
}

function CompanyInformationSection({ profile }: { profile: Record<string, unknown> }) {
  return (
    <Card title="Company information" subtitle="Manage your company profile." className="section--mt">
      <div className="stack">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Company name</label><div className="text-sm font-medium">{(profile.companyName as string) || 'Not set'}</div></div>
          <div><label className="form-label">Industry</label><div className="text-sm font-medium">{(profile.industry as string) || 'Not set'}</div></div>
          <div><label className="form-label">Location</label><div className="text-sm font-medium">{(profile.location as string) || 'Not set'}</div></div>
          <div><label className="form-label">Website</label><div className="text-sm font-medium">{(profile.website as string) || 'Not set'}</div></div>
        </div>
        <div>
          <label className="form-label">Description</label>
          <p className="text-sm text-secondary">{(profile.description as string) || 'No description provided.'}</p>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm">Edit company profile</Button>
        </div>
      </div>
    </Card>
  );
}

function CompanyVisibilitySection() {
  return (
    <Card title="Company visibility" subtitle="Control who can see your company profile." className="section--mt">
      <div className="form-group">
        <label className="form-label" htmlFor="company-visibility">Profile visibility</label>
        <select id="company-visibility" className="select" defaultValue="visible">
          <option value="visible">Visible to talent</option>
          <option value="hidden">Hidden from talent</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="recruiter-visibility">Recruiter visibility</label>
        <select id="recruiter-visibility" className="select" defaultValue="visible">
          <option value="visible">Visible to recruiters</option>
          <option value="hidden">Hidden from recruiters</option>
        </select>
      </div>
    </Card>
  );
}

function HiringPreferencesSection() {
  return (
    <Card title="Hiring preferences" subtitle="Set your preferred candidate and job criteria." className="section--mt">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Preferred experience</label><div className="text-sm text-secondary">Entry-level, Junior, Mid-level</div></div>
        <div><label className="form-label">Work arrangement</label><div className="text-sm text-secondary">Remote · Hybrid · On-site</div></div>
        <div><label className="form-label">Hiring locations</label><div className="text-sm text-secondary">Manila · Laguna · Remote</div></div>
        <div><label className="form-label">Employment types</label><div className="text-sm text-secondary">Full-time, Contract, Internship</div></div>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" size="sm">Edit hiring preferences</Button>
      </div>
    </Card>
  );
}

function AccountSecuritySection({ email }: { email?: string }) {
  return (
    <Card title="Account & security" subtitle="Email, password, and login settings." className="section--mt">
      <div className="stack">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Email address</div>
            <div className="text-xs text-tertiary">{email}</div>
          </div>
          <Button variant="ghost" size="sm">Change email</Button>
        </div>
        <div className="border-t" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Password</div>
            <div className="text-xs text-tertiary">••••••••</div>
          </div>
          <Button variant="ghost" size="sm">Change password</Button>
        </div>
        <div className="border-t" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Session</div>
            <div className="text-xs text-tertiary">Active on this device</div>
          </div>
          <Button variant="ghost" size="sm" className="text-danger">Log out</Button>
        </div>
      </div>
    </Card>
  );
}

export const AccountPage = () => {
  const { user, refreshUser } = useAuth();
  const role = (user?.role as UserRole) || 'STUDENT';

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [aiReadiness, setAiReadiness] = useState<AiReadiness | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState('');
  const [mediaRefresh, setMediaRefresh] = useState(0);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropKind, setCropKind] = useState<'avatar' | 'banner'>('avatar');
  const [activeSection, setActiveSection] = useState('overview');

  const loadBanner = async () => {
    try {
      const b = await usersApi.getBanner();
      setBannerUrl(b.bannerUrl);
    } catch {
      setBannerUrl(null);
    }
  };

  const reloadProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      if (role === 'EMPLOYER') {
        const data = await employersApi.getProfile();
        setProfile(data as Record<string, unknown>);
      } else if (role === 'ADMIN') {
        setProfile((user as Record<string, unknown>) || { name: 'Admin', email: user?.email || '' });
      } else {
        const data = await studentsApi.getProfile();
        setProfile(data as Record<string, unknown>);
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadMeta = async () => {
    if (role === 'STUDENT' && user?.id) {
      try {
        const [c, a] = await Promise.all([studentsApi.getProfileCompleteness(), studentsApi.getAiReadiness()]);
        setCompleteness(c);
        setAiReadiness(a);
      } catch {
        setCompleteness(null);
        setAiReadiness(null);
      }
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => openCrop(e, 'avatar');
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => openCrop(e, 'banner');

  const openCrop = (e: ChangeEvent<HTMLInputElement>, kind: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const setError = kind === 'avatar' ? setAvatarError : setBannerError;
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, or WebP.');
      return;
    }
    if (file.size > maxSize) {
      setError('File size must be under 5 MB.');
      return;
    }
    setError('');
    setCropKind(kind);
    setCropFile(file);
    setCropOpen(true);
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (cropKind === 'avatar') {
      try {
        await usersApi.uploadAvatar(blob);
        bumpProfileMediaVersion();
        setMediaRefresh((r) => r + 1);
        await reloadProfile();
        refreshUser();
      } catch {
        setAvatarError('Failed to upload avatar. Please try again.');
      }
      return;
    }
    try {
      const result = await usersApi.uploadBanner(blob);
      bumpProfileMediaVersion();
      setMediaRefresh((r) => r + 1);
      setBannerUrl(result.bannerUrl);
    } catch {
      setBannerError('Failed to upload banner. Please try again.');
    }
  };

  const closeCrop = () => {
    setCropOpen(false);
    setCropFile(null);
  };

  const selectSection = (key: string) => {
    setActiveSection(key);
    const el = document.getElementById('profile-shell');
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const jumpToSection = (section: string) => {
    const railKeys = new Set((role === 'EMPLOYER' ? EMPLOYER_RAIL : STUDENT_RAIL).map((item) => item.key));
    selectSection(railKeys.has(section) ? section : MISSING_LABEL_TO_SECTION[section] || section);
  };

  useEffect(() => { reloadProfile(); }, [role]);
  useEffect(() => { if (profile) loadMeta(); }, [profile]);
  useEffect(() => { setActiveSection('overview'); }, [role]);
  useEffect(() => { loadBanner(); }, [role, user?.id]);

  if (profileLoading) {
    return (
      <div className="page fade-in">
        <PageHeader title="Account" subtitle="Manage your profile and settings." />
        <Skeleton variant="card" lines={6} />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="page fade-in">
        <PageHeader title="Account" subtitle="Manage your profile and settings." />
        <Alert>
          Failed to load profile. <button onClick={reloadProfile} className="link">Retry</button>
        </Alert>
      </div>
    );
  }

  const railItems: RailItem[] = role === 'EMPLOYER'
    ? EMPLOYER_RAIL
    : STUDENT_RAIL.map((item) => ({ ...item, status: completeness ? railItemStatus(item.key, completeness.missing) : 'neutral' }));

  const renderPanel = () => {
    if (role === 'EMPLOYER') {
      switch (activeSection) {
        case 'company': return <CompanyInformationSection profile={profile} />;
        case 'visibility': return <CompanyVisibilitySection />;
        case 'hiring': return <HiringPreferencesSection />;
        case 'account': return <AccountSecuritySection email={user?.email} />;
        case 'danger': return <DangerZone />;
        default: return <EmployerOverviewPanel profile={profile} />;
      }
    }
    if (!user?.id) {
      return <EmptyState icon="User" title="Account unavailable" text="Unable to load your account sections." />;
    }
    switch (activeSection) {
      case 'overview':
        return <OverviewPanel profile={profile} user={user} completeness={completeness} aiReadiness={aiReadiness} onJump={jumpToSection} />;
      case 'personal':
        return (
          <>
            <PersonalInfoSection profile={profile} onUpdate={reloadProfile} />
            <HeadlineSection profile={profile} onUpdate={reloadProfile} />
            <AboutSection profile={profile} onUpdate={reloadProfile} />
          </>
        );
      case 'experience': return <ExperienceSection userId={user.id} onSectionClick={() => undefined} />;
      case 'education': return <EducationSection userId={user.id} onSectionClick={() => undefined} />;
      case 'skills': return <SkillsSection userId={user.id} onSectionClick={() => undefined} />;
      case 'certifications': return <CertificationsSection onSectionClick={() => undefined} />;
      case 'projects': return <ProjectsSection onSectionClick={() => undefined} />;
      case 'resume': return <ResumeSection />;
      case 'preferences': return <CareerPreferencesSection onSectionClick={() => undefined} />;
      case 'visibility': return <ProfileVisibilitySection profile={profile} onUpdate={reloadProfile} />;
      case 'notifications': return <TalentAccountSettings onUpdate={reloadProfile} />;
      case 'account': return <AccountSecuritySection email={user?.email} />;
      case 'danger': return <DangerZone />;
      default: return <OverviewPanel profile={profile} user={user} completeness={completeness} aiReadiness={aiReadiness} onJump={jumpToSection} />;
    }
  };

  if (role === 'ADMIN') {
    return (
      <div className="page fade-in">
        <PageHeader title="Account" subtitle="Manage your profile and settings." />

        {/* Identity Header */}
        <Card className="section--mt">
          <div className="flex items-start gap-4">
            <label className="avatar-upload">
              <Avatar src={user?.avatarUrl} name={(profile.name as string) || user?.name} size="xl" userId={user?.id} />
              <span className="avatar-upload__overlay" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => openCrop(e, 'avatar')} />
            </label>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{profile.name as string || user?.name || 'User'}</h2>
              <p className="text-secondary text-sm mt-1">{user?.email}</p>
              <p className="text-xs text-tertiary mt-1">Click your avatar to upload a photo.</p>
              {avatarError && <p className="text-xs text-danger mt-1" role="alert">{avatarError}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge kind="hiring">{getRoleLabel(role)}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Platform account" subtitle="Your administrative account information." className="section--mt">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email</label>
              <div className="text-sm font-medium">{user?.email}</div>
            </div>
            <div>
              <label className="form-label">Role</label>
              <div className="text-sm font-medium">{getRoleLabel('ADMIN')}</div>
            </div>
            <div>
              <label className="form-label">Account status</label>
              <div className="flex items-center gap-2">
                <span className="badge badge--open">Active</span>
              </div>
            </div>
            <div>
              <label className="form-label">Permissions</label>
              <div className="text-sm text-secondary">Full platform administration</div>
            </div>
          </div>
        </Card>

        <Card title="Security" subtitle="Manage your account security settings." className="section--mt">
          <div className="stack">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Password</div>
                <div className="text-xs text-tertiary">Last changed 30 days ago</div>
              </div>
              <Button variant="secondary" size="sm">Change password</Button>
            </div>
            <div className="border-t" />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Two-factor authentication</div>
                <div className="text-xs text-tertiary">Not enabled</div>
              </div>
              <Button variant="secondary" size="sm">Enable 2FA</Button>
            </div>
            <div className="border-t" />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Active sessions</div>
                <div className="text-xs text-tertiary">1 active session</div>
              </div>
              <Button variant="ghost" size="sm" className="text-danger">Sign out all sessions</Button>
            </div>
          </div>
        </Card>

        <Card title="Platform navigation" subtitle="Quick access to administration areas." className="section--mt">
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/admin/users', label: 'Users', icon: 'users' },
              { to: '/admin/jobs', label: 'Jobs', icon: 'jobs' },
              { to: '/admin/applications', label: 'Applications', icon: 'applications' },
              { to: '/admin/companies', label: 'Companies', icon: 'company' },
              { to: '/admin/audit-logs', label: 'Audit logs', icon: 'security' },
              { to: '/admin/settings', label: 'Settings', icon: 'settings' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="card card--compact card--hover flex items-center gap-3 no-underline text-inherit">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="ml-auto text-muted">›</span>
              </Link>
            ))}
          </div>
        </Card>

        <AccountSecuritySection email={user?.email} />
        <DangerZone />

        <ImageCropDialog open={cropOpen} file={cropFile} kind={cropKind} onCancel={closeCrop} onConfirm={(blob) => void handleCropConfirm(blob)} />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <PageHeader
        title={role === 'EMPLOYER' ? 'Company profile' : 'Profile'}
        subtitle={role === 'EMPLOYER' ? 'How your company appears to talent on GradTure.' : 'Your professional profile — make it stand out to employers.'}
      />

      <ProfileBanner role={role} profile={profile} user={user} avatarError={avatarError} bannerUrl={bannerUrl} bannerError={bannerError} mediaRefresh={mediaRefresh} onAvatarChange={handleAvatarChange} onBannerChange={handleBannerChange} />

      {role === 'STUDENT' && completeness && <ProfileStrength completeness={completeness} onJump={jumpToSection} />}

      <div className="profile-shell" id="profile-shell">
        <SectionRail items={railItems} active={activeSection} onSelect={selectSection} />
        <div className="profile-panel">{renderPanel()}</div>
      </div>

      <ImageCropDialog open={cropOpen} file={cropFile} kind={cropKind} onCancel={closeCrop} onConfirm={(blob) => void handleCropConfirm(blob)} />
    </div>
  );
};
