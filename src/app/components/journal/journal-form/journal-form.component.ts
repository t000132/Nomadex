import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Journal } from '../../../models/journal.model';

/**
 * Composant de formulaire pour créer/éditer une entrée de journal
 * Utilise ReactiveFormsModule avec 7 FormControl
 */
@Component({
  selector: 'app-journal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './journal-form.component.html',
  styleUrl: './journal-form.component.scss'
})
export class JournalFormComponent implements OnChanges {
  @Input() initialValue: Journal | null = null;
  @Input() voyageId: number | null = null;
  @Output() submitForm = new EventEmitter<Journal>();
  @Output() cancel = new EventEmitter<void>();

  journalForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.journalForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      date: ['', Validators.required],
      lieu: ['', [Validators.required, Validators.minLength(2)]],
      contenu: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      humeur: ['', Validators.required],
      meteo: ['', Validators.required],
      imageUrl: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.journalForm.patchValue({
        titre: this.initialValue.titre,
        date: this.initialValue.date,
        lieu: this.initialValue.lieu,
        contenu: this.initialValue.contenu,
        humeur: this.initialValue.humeur,
        meteo: this.initialValue.meteo,
        imageUrl: this.initialValue.imageUrl || ''
      });
    }
  }

  onSubmit(): void {
    if (this.journalForm.invalid) {
      this.journalForm.markAllAsTouched();
      return;
    }

    const journalData: Journal = {
      ...this.journalForm.value,
      id: this.initialValue?.id,
      userId: this.initialValue?.userId || 1,
      voyageId: this.voyageId || this.initialValue?.voyageId || 0,
      createdAt: this.initialValue?.createdAt || new Date().toISOString()
    };

    this.submitForm.emit(journalData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetForm(): void {
    this.journalForm.reset();
  }
}
