import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi, usersApi } from '../../core/api/endpoints/students';
import { resumesApi } from '../../core/api/endpoints/resumes';
import { employersApi } from '../../core/api/endpoints/employers';
import { getRoleLabel } from '../../core/utils/roleLabels';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea, FormSelect } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { Badge } from '../../components/Badge';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/Avatar';
import type { UserRole } from '../../core/types';
import type { Resume } from '../../core/types';

const VISIBILITY_OPTIONS = [
  { value: 'visible', label: 'Visible to employers', description: 'Employers can find you in search and view your profile.' },
  { value: 'applying', label: 'Only visible when applying', description: 'Employers see your profile only after you apply.' },
  { value: 'hidden', label: 'Hidden from employers', description: 'Your profile is not visible to employers at all.' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: '2_WEEKS', label: '2 weeks notice' },
  { value: '1_MONTH', label: '1 month notice' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

function ProfileCompletion({ profile }: { profile: Record<string, unknown> }) {
  const fields = [
    'name', 'focus', 'summary', 'skills', 'education', 'experience',
    'phone', 'location', 'website', 'linkedin', 'github', 'portfolio',
    'expectedSalary', 'availability', 'workAuthorization', 'degree', 'fieldOfStudy',
  ];
  const filled = fields.filter((f) => {
    const v = profile[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== '';
  }).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-secondary">Profile completeness</span>
        <span className="text-sm font-semibold text-primary">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-tertiary mt-2">
        {pct >= 80 ? "You're almost ready to receive better job matches." : 'Complete your profile to receive better job matches.'}
      </p>
    </div>
  );
}

function TalentVisibility({ profile, onUpdate }: { profile: Record<string, unknown>; onUpdate: () => void }) {
  const [visibility, setVisibility] = useState('visible');
  const [saving, setSaving] = useState(false);

  const handleChange = async (value: string) => {
    setVisibility(value);
    setSaving(true);
    try {
      await studentsApi.updateProfile({ ...profile, visibility } as Record<string, string>);
      onUpdate();
    } catch {
      setVisibility(visibility);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Profile visibility" subtitle="Control who can see your profile." className="section--mt">
      <div className="form-group">
        <label className="form-label">Employer discoverability</label>
           <select
            value={visibility}
            onChange={(e) => handleChange(e.target.value)}
            disabled={saving}
            className="select"
          >
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
                  <Button variant="ghost" size="sm">View</Button>
                  <Button variant="ghost" size="sm">Download</Button>
                  <Button variant="ghost" size="sm" className="text-danger">Delete</Button>
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
          <Icon name="upload" size={16} /> Upload new resume
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const maxSize = 5 * 1024 * 1024;
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
                if (file.size > maxSize) {
                  alert('File size must be under 5 MB.');
                  return;
                }
                if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
                  alert('Invalid file type. Please upload PDF, DOC, DOCX, or TXT.');
                  return;
                }
                resumesApi.upload(file).then(() => reload());
              }
            }}
          />
        </label>
      </div>
    </Card>
  );
}

function TalentCareerSection({ profile, onUpdate }: { profile: Record<string, unknown>; onUpdate: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const startEdit = (section: string) => {
    setEditing(section);
    setForm({ ...profile });
  };

  const save = async () => {
    setSaving(true);
    try {
      await studentsApi.updateProfile(form as Record<string, string>);
      onUpdate();
      setEditing(null);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      key: 'qualifications',
      title: 'Qualifications',
      description: profile.summary as string || 'Not provided',
      fields: ['summary', 'skills', 'education', 'experience'],
    },
    {
      key: 'preferences',
      title: 'Job preferences',
      description: `${profile.availability as string || 'Not set'} · ${profile.workAuthorization as string || 'Not set'}`,
      fields: ['availability', 'workAuthorization', 'expectedSalary'],
    },
    {
      key: 'availability',
      title: 'Availability',
      description: profile.availability as string || 'Not provided',
      fields: ['availability'],
    },
    {
      key: 'interests',
      title: 'Career interests',
      description: 'Select industries, job categories, and roles you are interested in.',
      fields: ['focus'],
    },
    {
      key: 'skills',
      title: 'Skills',
      description: Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills.join(', ') as string : 'No skills added',
      fields: ['skills'],
    },
    {
      key: 'experience',
      title: 'Experience',
      description: profile.experience as string || 'Not provided',
      fields: ['experience'],
    },
    {
      key: 'education',
      title: 'Education',
      description: profile.education as string || 'Not provided',
      fields: ['education'],
    },
  ];

  return (
    <Card title="Career profile" subtitle="Improve your job matches by completing your career profile." className="section--mt">
      <div className="stack">
        {sections.map((section) => (
          <div key={section.key} className="card card--compact border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="card__title">{section.title}</h4>
                <p className="card__subtitle">{editing === section.key ? '' : section.description}</p>
              </div>
              {editing === section.key ? (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => startEdit(section.key)}>
                  <Icon name="edit" size={16} /> Edit
                </Button>
              )}
            </div>
            {editing === section.key && (
              <div className="mt-4 stack">
                {section.fields.includes('summary') && (
                  <FormTextarea label="Summary" value={(form.summary as string) || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                )}
                {section.fields.includes('skills') && (
                  <FormInput label="Skills (comma separated)" value={(Array.isArray(form.skills) ? form.skills : []).join(', ')} onChange={(e) => setForm({ ...form, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                )}
                {section.fields.includes('experience') && (
                  <FormTextarea label="Experience" value={(form.experience as string) || ''} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                )}
                {section.fields.includes('education') && (
                  <FormTextarea label="Education" value={(form.education as string) || ''} onChange={(e) => setForm({ ...form, education: e.target.value })} />
                )}
                {section.fields.includes('availability') && (
                  <FormSelect label="Availability" value={(form.availability as string) || ''} onChange={(e) => setForm({ ...form, availability: e.target.value })} options={AVAILABILITY_OPTIONS} />
                )}
                {section.fields.includes('workAuthorization') && (
                  <FormInput label="Work authorization" value={(form.workAuthorization as string) || ''} onChange={(e) => setForm({ ...form, workAuthorization: e.target.value })} />
                )}
                {section.fields.includes('expectedSalary') && (
                  <FormInput label="Expected salary" type="number" value={(form.expectedSalary as string) || ''} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TalentAccountSettings({ onUpdate }: { onUpdate: () => void }) {
  const { data: settings, loading } = useAsync(() => studentsApi.getSettings(), []);
  const [form, setForm] = useState<Record<string, boolean | string | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await studentsApi.updateSettings(form as Record<string, unknown>);
      onUpdate();
    } catch {
      // handle error
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
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</Button>
        </div>
      </div>
    </Card>
  );
}

function DangerZone() {
  const [confirm, setConfirm] = useState(false);

  return (
    <Card title="Danger zone" className="section--mt">
      <p className="text-sm text-secondary mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      {confirm ? (
        <div className="flex gap-2">
          <Button variant="danger" size="sm">Yes, delete my account</Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>Delete account</Button>
      )}
    </Card>
  );
}

export const AccountPage = () => {
  const { user, refreshUser } = useAuth();
  const role = (user?.role as UserRole) || 'STUDENT';

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const reloadProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = role === 'EMPLOYER' ? await employersApi.getProfile() : await studentsApi.getProfile();
      setProfile(data as Record<string, unknown>);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    reloadProfile();
  }, [role]);

  const profileCompletion = useMemo(() => {
    if (!profile || typeof profile !== 'object') return 0;
    const fields = ['name', 'focus', 'summary', 'skills', 'education', 'experience', 'phone', 'location', 'website'];
    const filled = fields.filter((f) => {
      const v = (profile as Record<string, unknown>)[f];
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && v !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

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
        <div className="message message--error" role="alert">
          Failed to load profile. <button onClick={reloadProfile} className="link">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <PageHeader title="Account" subtitle="Manage your profile and settings." />

      {/* Identity Header */}
      <Card className="section--mt">
        <div className="flex items-start gap-4">
          <Avatar src={user?.avatarUrl} name={profile.name as string || user?.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{profile.name as string || user?.name || 'User'}</h2>
            <p className="text-secondary text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge kind="hiring">{getRoleLabel(role)}</Badge>
              {role === 'EMPLOYER' && Boolean((profile as Record<string, unknown>).verified) && (
                <Badge kind="open">Verified</Badge>
              )}
              {role === 'STUDENT' && (
                <span className="text-xs text-tertiary">{profileCompletion}% complete</span>
              )}
            </div>
            {role === 'STUDENT' && <ProfileCompletion profile={profile} />}
          </div>
          <div className="flex-shrink-0">
            <Button variant="secondary" size="sm">
              <Icon name="edit" size={16} /> Edit profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Avatar */}
      <Card title="Profile photo" subtitle="Upload a profile picture or use your initials." className="section--mt">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatarUrl} name={profile.name as string || user?.name} size="lg" />
          <div className="flex-1">
            <div className="flex gap-2">
              <label className="btn btn--secondary btn--sm">
                {user?.avatarUrl ? 'Change photo' : 'Add profile photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const maxSize = 5 * 1024 * 1024;
                      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Invalid file type. Please upload JPEG, PNG, or WebP.');
                        return;
                      }
                      if (file.size > maxSize) {
                        alert('File size must be under 5 MB.');
                        return;
                      }
                      usersApi.uploadAvatar(file).then(() => {
                        reloadProfile();
                        refreshUser();
                      }).catch(() => alert('Failed to upload avatar. Please try again.'));
                    }
                  }}
                />
              </label>
              {user?.avatarUrl && (
                <Button variant="ghost" size="sm" className="text-danger" onClick={() => usersApi.deleteAvatar().then(() => {
                  reloadProfile();
                  refreshUser();
                })}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-tertiary mt-2">JPEG, PNG or WebP. Max 5 MB.</p>
          </div>
        </div>
      </Card>

      {/* Role-specific sections */}
      {role === 'STUDENT' && (
        <>
          <TalentVisibility profile={profile} onUpdate={reloadProfile} />
          <ResumeSection />
          <TalentCareerSection profile={profile} onUpdate={reloadProfile} />
          <TalentAccountSettings onUpdate={reloadProfile} />
        </>
      )}

      {role === 'EMPLOYER' && (
        <>
          <Card title="Company information" subtitle="Manage your company profile." className="section--mt">
            <div className="stack">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Company name</label>
                  <div className="text-sm font-medium">{(profile as Record<string, unknown>).companyName as string || 'Not set'}</div>
                </div>
                <div>
                  <label className="form-label">Industry</label>
                  <div className="text-sm font-medium">{(profile as Record<string, unknown>).industry as string || 'Not set'}</div>
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <div className="text-sm font-medium">{(profile as Record<string, unknown>).location as string || 'Not set'}</div>
                </div>
                <div>
                  <label className="form-label">Website</label>
                  <div className="text-sm font-medium">{(profile as Record<string, unknown>).website as string || 'Not set'}</div>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <p className="text-sm text-secondary">{(profile as Record<string, unknown>).description as string || 'No description provided.'}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm">Edit company profile</Button>
              </div>
            </div>
          </Card>

          <Card title="Company visibility" subtitle="Control who can see your company profile." className="section--mt">
            <div className="form-group">
              <label className="form-label">Profile visibility</label>
               <select className="select" defaultValue="visible">
                 <option value="visible">Visible to talent</option>
                 <option value="hidden">Hidden from talent</option>
               </select>
             </div>
             <div className="form-group">
               <label className="form-label">Recruiter visibility</label>
               <select className="select" defaultValue="visible">
                <option value="visible">Visible to recruiters</option>
                <option value="hidden">Hidden from recruiters</option>
              </select>
            </div>
          </Card>

          <Card title="Hiring preferences" subtitle="Set your preferred candidate and job criteria." className="section--mt">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Preferred experience</label>
                <div className="text-sm text-secondary">Entry-level, Junior, Mid-level</div>
              </div>
              <div>
                <label className="form-label">Work arrangement</label>
                <div className="text-sm text-secondary">Remote · Hybrid · On-site</div>
              </div>
              <div>
                <label className="form-label">Hiring locations</label>
                <div className="text-sm text-secondary">Manila · Laguna · Remote</div>
              </div>
              <div>
                <label className="form-label">Employment types</label>
                <div className="text-sm text-secondary">Full-time, Contract, Internship</div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="secondary" size="sm">Edit hiring preferences</Button>
            </div>
          </Card>
        </>
      )}

      {role === 'ADMIN' && (
        <>
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
                { to: '/admin/audit-logs', label: 'Audit logs', icon: 'audit' },
                { to: '/admin/settings', label: 'Settings', icon: 'settings' },
              ].map((item) => (
                <a key={item.to} href={item.to} className="card card--compact card--hover flex items-center gap-3">
                  <Icon name={item.icon as any} size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                  <Icon name="chevron-right" size={16} className="ml-auto text-muted" />
                </a>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Account & Security */}
      <Card title="Account & security" subtitle="Email, password, and login settings." className="section--mt">
        <div className="stack">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Email address</div>
              <div className="text-xs text-tertiary">{user?.email}</div>
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

      <DangerZone />
    </div>
  );
};
