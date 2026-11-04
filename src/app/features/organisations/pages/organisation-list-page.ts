import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { OrganisationStore } from '../services/organisation.store';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-organisation-list-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './organisation-list-page.html',
  styleUrl: './organisation-list-page.scss',
})
export class OrganisationListPage {
  protected readonly store = inject(OrganisationStore);

  protected readonly translation = inject(TranslationService);

  constructor() {
    this.store.loadOrganisations();
  }
}
