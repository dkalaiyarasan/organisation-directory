import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import type { RawOrganisation } from '../models/raw-organisation.model';
import type { Organisation } from '../models/organisation.model';

import { normaliseOrganisations } from '../../../core/utils/organisation-normaliser';
import { OrganisationNormalisationResult } from '../models/organisation-normalisation-result.model';

@Injectable({
  providedIn: 'root',
})
export class OrganisationFixtureService {
  private readonly http = inject(HttpClient);

  private readonly fixtureUrl = 'assets/data/organisations.json';

  getOrganisations(): Observable<OrganisationNormalisationResult> {
    return this.http
      .get<RawOrganisation[]>(this.fixtureUrl)
      .pipe(map((records) => normaliseOrganisations(records)));
  }
}
