import { jobsApi } from '../../core/api/endpoints/jobs';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea, FormSelect } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['HIRING', 'INTERNSHIP', 'APPRENTICESHIP', 'CONTRACT', 'TEMPORARY', 'FREELANCE', 'PART_TIME']),
  experienceLevel: z.enum(['NO_EXPERIENCE', 'ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER']),
  workplaceType: z.enum(['ONSITE', 'HYBRID', 'REMOTE']),
  requiredSkills: z.array(z.string()).min(1, 'Add at least one required skill'),
  preferredSkills: z.array(z.string()).optional(),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
});

type JobValues = z.infer<typeof jobSchema>;

export const EmployerPostJobPage = () => {
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: jobSchema,
    initialValues: {
      title: '',
      company: '',
      location: '',
      type: 'HIRING' as const,
      experienceLevel: 'ENTRY_LEVEL' as const,
      workplaceType: 'ONSITE' as const,
      requiredSkills: [''],
      preferredSkills: [],
      description: '',
      responsibilities: '',
      benefits: [],
      salaryMin: undefined,
      salaryMax: undefined,
    },
    onSubmit: async (values: JobValues) => {
      const payload: Record<string, unknown> = {
        ...values,
        requiredSkills: values.requiredSkills.filter(Boolean),
        preferredSkills: values.preferredSkills?.filter(Boolean) ?? [],
        benefits: values.benefits?.filter(Boolean) ?? [],
      };
      if (payload.salaryMin === undefined || isNaN(Number(payload.salaryMin))) delete payload.salaryMin;
      if (payload.salaryMax === undefined || isNaN(Number(payload.salaryMax))) delete payload.salaryMax;
      await jobsApi.create(payload);
    },
  });

  const renderList = (field: 'requiredSkills' | 'preferredSkills' | 'benefits', label: string, placeholder: string) => {
    const list = values[field] as string[];
    return (
      <div className="stack">
        {list.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <FormInput
              label={idx === 0 ? label : ''}
              id={`${field}-${idx}`}
              value={item}
              onChange={(e) => {
                const next = [...list];
                next[idx] = e.target.value;
                handleChange(field, next);
              }}
              onBlur={() => handleBlur(field)}
              placeholder={idx === 0 ? placeholder : ''}
            />
            {list.length > 1 && (
              <Button variant="ghost" size="sm" type="button" className="mt-6" onClick={() => handleChange(field, list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" type="button" onClick={() => handleChange(field, [...list, ''])}>
          + Add {label.toLowerCase()}
        </Button>
      </div>
    );
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Post a job" subtitle="Create a new opening and start receiving applicants." />

      <div className="form-container">
        <form onSubmit={handleSubmit} className="stack">
          <Card title="Basics">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Job title" id="job-title" required value={values.title} onChange={(e) => handleChange('title', e.target.value)} onBlur={() => handleBlur('title')} placeholder="e.g. Senior React Engineer" error={touched.title ? errors.title : undefined} />
              <FormInput label="Company" id="job-company" required value={values.company} onChange={(e) => handleChange('company', e.target.value)} onBlur={() => handleBlur('company')} placeholder="Company name" error={touched.company ? errors.company : undefined} />
              <FormInput label="Location" id="job-location" required value={values.location} onChange={(e) => handleChange('location', e.target.value)} onBlur={() => handleBlur('location')} placeholder="e.g. Remote, Austin, TX" error={touched.location ? errors.location : undefined} />
              <FormSelect label="Type" id="job-type" value={values.type} onChange={(e) => handleChange('type', e.target.value)} options={[
                { value: 'HIRING', label: 'Hiring' },
                { value: 'INTERNSHIP', label: 'Internship' },
                { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'TEMPORARY', label: 'Temporary' },
                { value: 'FREELANCE', label: 'Freelance' },
                { value: 'PART_TIME', label: 'Part-time' },
              ]} error={touched.type ? errors.type : undefined} />
              <FormSelect label="Experience level" id="job-experience" value={values.experienceLevel} onChange={(e) => handleChange('experienceLevel', e.target.value)} options={[
                { value: 'NO_EXPERIENCE', label: 'No experience' },
                { value: 'ENTRY_LEVEL', label: 'Entry level' },
                { value: 'JUNIOR', label: 'Junior' },
                { value: 'MID_LEVEL', label: 'Mid level' },
                { value: 'SENIOR', label: 'Senior' },
                { value: 'LEAD', label: 'Lead' },
                { value: 'MANAGER', label: 'Manager' },
              ]} error={touched.experienceLevel ? errors.experienceLevel : undefined} />
              <FormSelect label="Workplace type" id="job-workplace" value={values.workplaceType} onChange={(e) => handleChange('workplaceType', e.target.value)} options={[
                { value: 'ONSITE', label: 'On-site' },
                { value: 'HYBRID', label: 'Hybrid' },
                { value: 'REMOTE', label: 'Remote' },
              ]} error={touched.workplaceType ? errors.workplaceType : undefined} />
            </div>
          </Card>

          <Card title="Skills" subtitle="Required and preferred skills for this role.">
            {renderList('requiredSkills', 'Required skills', 'e.g. TypeScript, React, Node.js')}
            {renderList('preferredSkills', 'Preferred skills', 'e.g. GraphQL, Docker')}
          </Card>

          <Card title="Description">
            <div className="stack">
              <FormTextarea label="Role overview" id="job-desc" value={values.description} onChange={(e) => handleChange('description', e.target.value)} onBlur={() => handleBlur('description')} placeholder="What is the role about?" error={touched.description ? errors.description : undefined} />
              <FormTextarea label="Responsibilities" id="job-resp" value={values.responsibilities} onChange={(e) => handleChange('responsibilities', e.target.value)} onBlur={() => handleBlur('responsibilities')} placeholder="Key responsibilities and day-to-day tasks…" />
            </div>
          </Card>

          <Card title="Compensation">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Minimum salary" id="job-salary-min" type="number" value={values.salaryMin ?? ''} onChange={(e) => handleChange('salaryMin', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 30000" />
              <FormInput label="Maximum salary" id="job-salary-max" type="number" value={values.salaryMax ?? ''} onChange={(e) => handleChange('salaryMax', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 50000" />
            </div>
          </Card>

          <Card title="Benefits">
            {renderList('benefits', 'Benefits', 'e.g. Health insurance, Remote work')}
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing…' : 'Publish job'}</Button>
          </div>
          {formError && <div className="message message--error" role="alert">{formError}</div>}
        </form>
      </div>
    </div>
  );
};
