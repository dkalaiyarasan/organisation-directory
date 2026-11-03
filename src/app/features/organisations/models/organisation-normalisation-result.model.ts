import type { Organisation } from './organisation.model';
import type { RawOrganisation } from './raw-organisation.model';

export interface RejectedOrganisation {
  raw: RawOrganisation;
  reason: 'missing-id' | 'missing-name';
}

export interface OrganisationNormalisationResult {
  organisations: Organisation[];
  rejected: RejectedOrganisation[];
  totalRecords: number;
}
