import { PhosphorIcon } from './PhosphorIcon';

type Company = {
  name: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  description?: string;
};

type CompanyCardProps = {
  company: Company;
};

export const CompanyCard = ({ company }: CompanyCardProps) => (
  <div className="rounded-xl border border-border/50 bg-surface p-4">
    <h3 className="text-sm font-semibold text-text">{company.name}</h3>
    <div className="mt-2 space-y-1.5">
      {company.industry && (
        <p className="text-xs text-text-secondary flex items-center gap-1.5">
          <PhosphorIcon name="Buildings" size={13} weight="fill" />
          {company.industry}
        </p>
      )}
      {company.size && (
        <p className="text-xs text-text-secondary flex items-center gap-1.5">
          <PhosphorIcon name="Users" size={13} weight="fill" />
          {company.size}
        </p>
      )}
      {company.location && (
        <p className="text-xs text-text-secondary flex items-center gap-1.5">
          <PhosphorIcon name="MapPin" size={13} weight="fill" />
          {company.location}
        </p>
      )}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1.5 mt-2"
        >
          <PhosphorIcon name="Link" size={13} />
          Visit website
        </a>
      )}
    </div>
  </div>
);
