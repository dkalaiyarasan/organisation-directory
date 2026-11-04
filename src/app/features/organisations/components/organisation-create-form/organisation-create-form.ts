import { AfterViewInit, Component, ElementRef, ViewChild, inject, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { OrganisationStore } from '../../services/organisation.store';
import type { Organisation, OrganisationStatus } from '../../models/organisation.model';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-organisation-create-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './organisation-create-form.html',
  styleUrl: './organisation-create-form.scss',
})
export class OrganisationCreateForm implements AfterViewInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly store = inject(OrganisationStore);
  protected readonly translation = inject(TranslationService);
  @ViewChild('dialog')
  private dialog!: ElementRef<HTMLDialogElement>;

  readonly closed = output<void>();
  readonly created = output<void>();

  readonly form = this.formBuilder.group({
    name: this.formBuilder.control('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        this.uniqueNameValidator(),
      ],
      updateOn: 'blur',
    }),

    status: this.formBuilder.control<OrganisationStatus | ''>('', {
      validators: [Validators.required],
    }),

    ownerEmail: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      updateOn: 'blur',
    }),

    memberCount: new FormControl<number | null>(null, {
      validators: [Validators.min(0)],
    }),
  });

  ngAfterViewInit(): void {
    this.dialog.nativeElement.showModal();
  }

  private uniqueNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = String(control.value ?? '').trim();

      if (!name) {
        return null;
      }

      return this.store.organisationNameExists(name) ? { duplicateName: true } : null;
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const organisation: Organisation = {
      id: crypto.randomUUID(),
      name: formValue.name.trim(),
      status: formValue.status as OrganisationStatus,
      memberCount: formValue.memberCount ?? 0,
      owner: formValue.ownerEmail.trim(),
      createdAt: new Date(),
    };

    if (!this.store.addOrganisation(organisation)) {
      this.form.controls.name.setErrors({ duplicateName: true });
      return;
    }

    this.created.emit();
    this.close();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  onDialogClose(): void {
    this.closed.emit();
  }
}
