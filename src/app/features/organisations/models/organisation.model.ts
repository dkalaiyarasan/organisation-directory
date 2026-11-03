export type OrganisationStatus = 'active' | 'inactive' | 'pending' | 'unknown';

export interface Organisation {
  id: string;
  name: string;
  status: OrganisationStatus;
  memberCount: number;
  owner: string;
  createdAt: Date | null;
}
