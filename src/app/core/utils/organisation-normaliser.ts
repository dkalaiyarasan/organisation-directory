import type {
  Organisation,
  OrganisationStatus,
} from '../../features/organisations/models/organisation.model';

import type { RawOrganisation } from '../../features/organisations/models/raw-organisation.model';

import type {
  OrganisationNormalisationResult,
  RejectedOrganisation,
} from '../../features/organisations/models/organisation-normalisation-result.model';

function normaliseStatus(value: string | null | undefined): OrganisationStatus {
  const status = value?.trim().toLowerCase();

  if (status === 'active' || status === 'inactive' || status === 'pending') {
    return status;
  }

  return 'unknown';
}

function normaliseMemberCount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return Math.floor(parsedValue);
}

function normaliseOwner(value: RawOrganisation['owner']): string {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') return value.email?.trim() ?? '';
  return '';
}

function normaliseDate(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function normaliseOrganisation(raw: RawOrganisation): Organisation | null {
  const id = raw.id === null || raw.id === undefined ? '' : String(raw.id).trim();

  const name = raw.name?.trim() ?? '';

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    status: normaliseStatus(raw.status),
    memberCount: normaliseMemberCount(raw.memberCount),
    owner: normaliseOwner(raw.owner),
    createdAt: normaliseDate(raw.createdAt),
  };
}

export function normaliseOrganisations(
  records: readonly RawOrganisation[],
): OrganisationNormalisationResult {
  const organisations: Organisation[] = [];
  const rejected: RejectedOrganisation[] = [];

  for (const raw of records) {
    const id = raw.id === null || raw.id === undefined ? '' : String(raw.id).trim();

    const name = raw.name?.trim() ?? '';

    if (!id) {
      rejected.push({ raw, reason: 'missing-id' });
      continue;
    }

    if (!name) {
      rejected.push({ raw, reason: 'missing-name' });
      continue;
    }

    const organisation = normaliseOrganisation(raw);

    if (organisation) {
      organisations.push(organisation);
    }
  }

  return {
    organisations,
    rejected,
    totalRecords: records.length,
  };
}
