import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrganisationFixtureService } from './features/organisations/services/organisation-fixture.service';
import type { Organisation } from './features/organisations/models/organisation.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('organisation-directory');
  private readonly organisationFixtureService = inject(OrganisationFixtureService);
  protected readonly organisations = signal<Organisation[]>([]);
  protected readonly rejectedCount = signal(0);
  protected readonly rawRecordCount = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.organisationFixtureService.getOrganisations().subscribe({
      next: (result) => {
        this.organisations.set(result.organisations);
        this.rejectedCount.set(result.rejected.length);
        this.rawRecordCount.set(result.totalRecords);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load organisations.');
        this.loading.set(false);
      },
    });
  }
}
