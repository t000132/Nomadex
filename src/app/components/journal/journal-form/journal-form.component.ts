import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JournalService } from '../../../services/journal.service';
import { Journal } from '../../../models/journal.model';

@Component({
  selector: 'app-journal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './journal-form.component.html',
  styleUrl: './journal-form.component.scss'
})
export class JournalFormComponent implements OnInit {
  @Input() voyageId!: number;
  @Output() journalCreated = new EventEmitter<Journal>();
  @Output() cancelled = new EventEmitter<void>();

  journalForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  humeurOptions = ['😊 Heureux', '😎 Excité', '😌 Détendu', '🤔 Pensif', '😴 Fatigué'];
  meteoOptions = ['☀️ Ensoleillé', '⛅ Nuageux', '🌧️ Pluvieux', '❄️ Neigeux', '⛈️ Orageux'];

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService
  ) {}

  ngOnInit(): void {
    this.journalForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      lieu: ['', [Validators.required]],
      contenu: ['', [Validators.required, Validators.minLength(20)]],
      humeur: [''],
      meteo: [''],
      imageUrl: ['']
    });
  }

  onSubmit(): void {
    if (this.journalForm.invalid) {
      this.markFormGroupTouched(this.journalForm);
      return;
    }

    if (!this.voyageId) {
      this.errorMessage = 'Voyage non spécifié';
      return;
    }

    this.isSubmitting = true;
    const journalData = {
      ...this.journalForm.value,
      voyageId: this.voyageId
    };

    this.journalService.createJournal(journalData).subscribe({
      next: (journal) => {
        this.journalCreated.emit(journal);
        this.journalForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création de l\'entrée de journal';
        this.isSubmitting = false;
        console.error(error);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
    this.journalForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get titre() { return this.journalForm.get('titre'); }
  get date() { return this.journalForm.get('date'); }
  get lieu() { return this.journalForm.get('lieu'); }
  get contenu() { return this.journalForm.get('contenu'); }
}
