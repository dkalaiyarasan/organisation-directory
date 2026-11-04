import { Component, DestroyRef, inject, Injector, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, skip } from 'rxjs';

import {
  OrganisationStore,
  type OrganisationSortOrder,
  type OrganisationStatusFilter,
} from '../services/organisation.store';

import type { OrganisationStatus } from '../models/organisation.model';

import { TranslationService } from '../../../core/services/translation.service';
import { OrganisationCreateForm } from '../components/organisation-create-form/organisation-create-form';

@Component({
  selector: 'app-organisation-list-page',
  standalone: true,
  imports: [DatePipe, OrganisationCreateForm],
  templateUrl: './organisation-list-page.html',
  styleUrl: './organisation-list-page.scss',
})
export class OrganisationListPage {
  protected readonly store = inject(OrganisationStore);
  protected readonly translation = inject(TranslationService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly createFormOpen = signal(false);

  private readonly validStatuses: OrganisationStatus[] = [
    'active',
    'inactive',
    'pending',
    'unknown',
  ];

  protected readonly sortOptions: {
    value: OrganisationSortOrder;
    label: string;
  }[] = [
    { value: 'name-asc', label: 'organisation.sortNameAsc' },
    { value: 'name-desc', label: 'organisation.sortNameDesc' },
    { value: 'createdAt-desc', label: 'organisation.sortNewest' },
    { value: 'createdAt-asc', label: 'organisation.sortOldest' },
  ];

  constructor() {
    this.subscribeToQueryParams();
    this.subscribeToSearchChanges();
    this.store.loadOrganisations();
  }

  openCreateForm(): void {
    this.createFormOpen.set(true);
  }

  closeCreateForm(): void {
    this.createFormOpen.set(false);
  }

  private subscribeToQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const search = params.get('search') ?? '';
      const rawStatus = params.get('status');

      const status: OrganisationStatusFilter =
        rawStatus === null || rawStatus === 'all'
          ? 'all'
          : this.isValidStatus(rawStatus)
            ? rawStatus
            : 'all';

      this.store.setSearchTerm(search);
      this.store.setStatusFilter(status);

      if (rawStatus !== null && (rawStatus === 'all' || !this.isValidStatus(rawStatus))) {
        this.updateQueryParams({ status: 'all' });
      }
    });
  }

  private subscribeToSearchChanges(): void {
    toObservable(this.store.searchTerm, { injector: this.injector })
      .pipe(skip(1), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => this.updateQueryParams({ search }));
  }

  private isValidStatus(value: string): value is OrganisationStatus {
    return this.validStatuses.includes(value as OrganisationStatus);
  }

  onSortChange(value: string): void {
    const isValidSortOrder = this.sortOptions.some((option) => option.value === value);

    if (isValidSortOrder) {
      this.store.setSortOrder(value as OrganisationSortOrder);
    }
  }

  onStatusChange(value: string): void {
    const status: OrganisationStatusFilter =
      value === 'all' || this.isValidStatus(value) ? value : 'all';

    this.store.setStatusFilter(status);
    this.updateQueryParams({ status });
  }

  private updateQueryParams(params: { search?: string; status?: OrganisationStatusFilter }): void {
    const queryParams: Record<string, string | null> = {};
    let hasChanges = false;

    if (params.search !== undefined) {
      const search = params.search.trim();
      const currentSearch = this.route.snapshot.queryParamMap.get('search') ?? '';

      if (search !== currentSearch) {
        queryParams['search'] = search || null;
        hasChanges = true;
      }
    }

    if (params.status !== undefined) {
      const status = params.status === 'all' ? null : params.status;
      const currentStatus = this.route.snapshot.queryParamMap.get('status');

      if (status !== currentStatus) {
        queryParams['status'] = status;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
