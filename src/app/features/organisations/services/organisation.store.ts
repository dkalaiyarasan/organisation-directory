import { computed, inject, Injectable, signal } from '@angular/core';

import { OrganisationApiService } from './organisation-api.service';

import type { Organisation } from '../models/organisation.model';

@Injectable({
  providedIn: 'root',
})
export class OrganisationStore {
  private readonly api = inject(OrganisationApiService);

  // Private writable signals.
  private readonly _organisations = signal<Organisation[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _rejectedCount = signal(0);
  private readonly _rawRecordCount = signal(0);
  private readonly _loaded = signal(false);

  // Public read-only signals.
  readonly organisations = this._organisations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly rejectedCount = this._rejectedCount.asReadonly();
  readonly rawRecordCount = this._rawRecordCount.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly validCount = computed(() => this._organisations().length);

  loadOrganisations(): void {
    if (this._loading() || this._loaded()) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.api.getAllOrganisations().subscribe({
      next: (result) => {
        this._organisations.set(result.organisations);
        this._rejectedCount.set(result.rejected.length);
        this._rawRecordCount.set(result.totalRecords);
        this._loaded.set(true);
        this._loading.set(false);
      },

      error: () => {
        this._error.set('Unable to load organisations. Please try again.');
        this._loading.set(false);
      },
    });
  }

  retry(): void {
    this.loadOrganisations();
  }
}
