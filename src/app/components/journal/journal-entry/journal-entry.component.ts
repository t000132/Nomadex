import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Journal } from '../../../models/journal.model';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { CardHoverDirective } from '../../../directives/card-hover.directive';

/**
 * Composant pour afficher une entrée de journal
 * Utilise @Input pour recevoir les données du journal
 */
@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, CardHoverDirective],
  templateUrl: './journal-entry.component.html',
  styleUrl: './journal-entry.component.scss'
})
export class JournalEntryComponent {
  @Input({ required: true }) entry!: Journal;
  @Input() showImage: boolean = true;
}
