import type { RawOrganisation } from './raw-organisation.model';

export interface OrganisationPage {
  data: RawOrganisation[];
  page: number;
  pageSize: number;
  total: number;
}
