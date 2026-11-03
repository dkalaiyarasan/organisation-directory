export interface RawOrganisationOwner {
  email?: string | null;
}

export interface RawOrganisation {
  id?: string | number | null;
  name?: string | null;
  status?: string | null;
  memberCount?: number | string | null;
  owner?: string | RawOrganisationOwner | null;
  createdAt?: string | number | null;
}
