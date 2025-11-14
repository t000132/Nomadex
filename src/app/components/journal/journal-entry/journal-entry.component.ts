import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Journal } from '../../../models/journal.model';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './journal-entry.component.html',
  styleUrl: './journal-entry.component.scss'
})
export class JournalEntryComponent {
  @Input() entry!: Journal;
  @Input() showImage: boolean = true;

  getDefaultImage(): string {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop';
  }
}
