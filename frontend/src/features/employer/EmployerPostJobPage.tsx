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
  type: z.enum(['HIRING', 'INTERNSHIP']),
  description: z.string().optional(),
});

type JobValues = z.infer<typeof jobSchema>;

export const EmployerPostJobPage = () => {
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: jobSchema,
    initialValues: { title: '', company: '', location: '', type: 'HIRING' as const, description: '' },
    onSubmit: async (values: JobValues) => {
      await jobsApi.create(values);
    },
  });

  return (
    <div className="page fade-in">
      <PageHeader title="Post a job" subtitle="Create a hiring role or an internship." />

      <div className="form-container">
        <Card title="Job details">
          <form onSubmit={handleSubmit} className="stack">
            <FormInput label="Title" id="job-title" required value={values.title} onChange={(e) => handleChange('title', e.target.value)} onBlur={() => handleBlur('title')} placeholder="e.g. Senior React Engineer" error={touched.title ? errors.title : undefined} />
            <FormInput label="Company" id="job-company" required value={values.company} onChange={(e) => handleChange('company', e.target.value)} onBlur={() => handleBlur('company')} placeholder="Company name" error={touched.company ? errors.company : undefined} />
            <FormInput label="Location" id="job-location" required value={values.location} onChange={(e) => handleChange('location', e.target.value)} onBlur={() => handleBlur('location')} placeholder="e.g. Remote, Austin, TX" error={touched.location ? errors.location : undefined} />
            <FormSelect label="Type" id="job-type" value={values.type} onChange={(e) => handleChange('type', e.target.value)} options={[
              { value: 'HIRING', label: 'Hiring' },
              { value: 'INTERNSHIP', label: 'Internship' },
            ]} error={touched.type ? errors.type : undefined} />
            <FormTextarea label="Description" id="job-desc" value={values.description} onChange={(e) => handleChange('description', e.target.value)} onBlur={() => handleBlur('description')} placeholder="Role overview, responsibilities, requirements…" error={touched.description ? errors.description : undefined} />
            <div>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Posting…' : 'Post job'}</Button>
            </div>
            {formError && <div className="message message--error" role="alert">{formError}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
};
