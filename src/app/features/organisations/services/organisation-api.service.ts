import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  concatMap,
  defer,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  throwError,
  timer,
  toArray,
} from 'rxjs';

import type { RawOrganisation } from '../models/raw-organisation.model';
import type { OrganisationPage } from '../models/organisation-page.model';
import type { OrganisationNormalisationResult } from '../models/organisation-normalisation-result.model';

import { normaliseOrganisations } from '../../../core/utils/organisation-normaliser';

@Injectable({
  providedIn: 'root',
})
export class OrganisationApiService {
  private readonly http = inject(HttpClient);

  private readonly fixtureUrl = 'assets/data/organisations.json';

  private readonly pageSize = 25;

  private readonly maxRequestsPerMinute = 5;

  private readonly rateLimitWindowMs = 60_000;

  private requestStartTimes: number[] = [];

  // Load and cache the raw fixture once.
  private readonly rawRecords$: Observable<RawOrganisation[]> = this.http
    .get<RawOrganisation[]>(this.fixtureUrl)
    .pipe(
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );

  getAllOrganisations(): Observable<OrganisationNormalisationResult> {
    return this.rawRecords$.pipe(
      switchMap((records) => {
        const totalPages = Math.ceil(records.length / this.pageSize);

        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        return from(pages).pipe(
          concatMap((page) =>
            this.waitForRequestSlot().pipe(switchMap(() => this.requestPage(records, page))),
          ),
          toArray(),
          map((responses) =>
            normaliseOrganisations(responses.flatMap((response) => response.data)),
          ),
        );
      }),
    );
  }

  // Enforce a maximum of five request starts in any rolling 60-second window.
  private waitForRequestSlot(): Observable<void> {
    return defer(() => {
      const now = Date.now();

      // Remove request timestamps outside the rolling window.
      this.requestStartTimes = this.requestStartTimes.filter(
        (timestamp) => now - timestamp < this.rateLimitWindowMs,
      );

      if (this.requestStartTimes.length < this.maxRequestsPerMinute) {
        this.requestStartTimes.push(now);

        return of(undefined);
      }

      const oldestRequest = this.requestStartTimes[0];

      const waitMs = oldestRequest + this.rateLimitWindowMs - now + 1;

      return timer(waitMs).pipe(switchMap(() => this.waitForRequestSlot()));
    });
  }

  private requestPage(
    records: readonly RawOrganisation[],
    page: number,
  ): Observable<OrganisationPage> {
    const startIndex = (page - 1) * this.pageSize;

    const response: OrganisationPage = {
      data: records.slice(startIndex, startIndex + this.pageSize),
      page,
      pageSize: this.pageSize,
      total: records.length,
    };

    // Simulate network latency between 400 and 900 milliseconds.
    const delayMs = Math.floor(Math.random() * 501) + 400;

    return timer(delayMs).pipe(
      switchMap(() => {
        // Simulate approximately 15% failure per list request.
        if (Math.random() < 0.15) {
          return throwError(() => new Error('Simulated organisation list request failed.'));
        }

        return of(response);
      }),
    );
  }
}
