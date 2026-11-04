import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/organisations/pages/organisation-list-page').then(
        (module) => module.OrganisationListPage,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
