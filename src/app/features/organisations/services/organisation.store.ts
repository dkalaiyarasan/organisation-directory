import { computed, inject, Injectable, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { OrganisationApiService } from './organisation-api.service';

import type { Organisation, OrganisationStatus } from '../models/organisation.model';

export type OrganisationSortOrder = 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc';

export type OrganisationStatusFilter = 'all' | OrganisationStatus;

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

  private readonly _sortOrder = signal<OrganisationSortOrder>('name-asc');
  private readonly _searchTerm = signal('');
  private readonly _statusFilter = signal<OrganisationStatusFilter>('all');

  // RxJS Subject handles search debounce timing.
  private readonly searchInput$ = new Subject<string>();

  // Public read-only signals.
  readonly organisations = this._organisations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly rejectedCount = this._rejectedCount.asReadonly();
  readonly rawRecordCount = this._rawRecordCount.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly sortOrder = this._sortOrder.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();

  readonly validCount = computed(() => this._organisations().length);

  constructor() {
    this.searchInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
      this._searchTerm.set(searchTerm.trim());
    });
  }

  // Filter organisations by name and status.
  readonly filteredOrganisations = computed(() => {
    const organisations = this._organisations();
    const searchTerm = this._searchTerm().toLocaleLowerCase();
    const statusFilter = this._statusFilter();

    return organisations.filter((organisation) => {
      const matchesName = !searchTerm || organisation.name.toLocaleLowerCase().includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || organisation.status === statusFilter;

      return matchesName && matchesStatus;
    });
  });

  // Sort filtered organisations without modifying the original array.
  readonly sortedOrganisations = computed(() => {
    const organisations = [...this.filteredOrganisations()];
    const sortOrder = this._sortOrder();

    return organisations.sort((a, b) => {
      if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name);
      }

      if (sortOrder === 'name-desc') {
        return b.name.localeCompare(a.name);
      }

      // Organisations without a valid date remain at the end.
      if (a.createdAt === null && b.createdAt === null) {
        return 0;
      }

      if (a.createdAt === null) {
        return 1;
      }

      if (b.createdAt === null) {
        return -1;
      }

      const difference = a.createdAt.getTime() - b.createdAt.getTime();

      return sortOrder === 'createdAt-asc' ? difference : -difference;
    });
  });

  // Check for an existing organisation name, ignoring letter case.
  organisationNameExists(name: string): boolean {
    const normalizedName = name.trim().toLowerCase();

    return this._organisations().some(
      (organisation) => organisation.name.trim().toLowerCase() === normalizedName,
    );
  }

  // Add a new organisation while protecting against duplicate names.
  addOrganisation(organisation: Organisation): boolean {
    if (this.organisationNameExists(organisation.name)) {
      return false;
    }

    this._organisations.update((organisations) => [...organisations, organisation]);

    return true;
  }

  setSortOrder(sortOrder: OrganisationSortOrder): void {
    this._sortOrder.set(sortOrder);
  }

  setSearchTerm(searchTerm: string): void {
    this.searchInput$.next(searchTerm);
  }

  setStatusFilter(status: OrganisationStatusFilter): void {
    this._statusFilter.set(status);
  }

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
        this._error.set('organisation.loadError');
        this._loading.set(false);
      },
    });
  }

  retry(): void {
    this.loadOrganisations();
  }
}
