import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

type TranslationValue = string | { [key: string]: TranslationValue };

type TranslationDictionary = {
  [key: string]: TranslationValue;
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly http = inject(HttpClient);

  private readonly translations = signal<TranslationDictionary>({});

  readonly loaded = signal(false);

  loadTranslations(): void {
    this.http
      .get<TranslationDictionary>('assets/i18n/en.json')
      .pipe(catchError(() => of({})))
      .subscribe((translations) => {
        this.translations.set(translations);
        this.loaded.set(true);
      });
  }

  translate(key: string): string {
    const value = key
      .split('.')
      .reduce<TranslationValue | undefined>(
        (current, part) =>
          typeof current === 'object' && current !== null ? current[part] : undefined,
        this.translations(),
      );

    return typeof value === 'string' ? value : key;
  }
}
