import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Voyage } from '../../../models/voyage.model';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { CardHoverDirective } from '../../../directives/card-hover.directive';

/**
 * Composant réutilisable pour afficher une carte de voyage
 * Utilise @Input pour recevoir les données et @Output pour émettre les événements
 * Applique la directive appCardHover pour les effets au survol
 */
@Component({
  selector: 'app-voyage-card',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, CardHoverDirective],
  templateUrl: './voyage-card.component.html',
  styleUrl: './voyage-card.component.scss'
})
export class VoyageCardComponent {
  @Input({ required: true }) voyage!: Voyage;
  @Input() disableActions = false;
  @Input() isDeleting = false;
  @Output() viewDetail = new EventEmitter<Voyage>();
  @Output() edit = new EventEmitter<Voyage>();
  @Output() remove = new EventEmitter<Voyage>();

  get coverImage(): string | undefined {
    return this.voyage.imageData || this.voyage.galleries?.[0] || this.voyage.imageUrl;
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.voyage);
  }

  onEdit(): void {
    this.edit.emit(this.voyage);
  }

  onRemove(): void {
    this.remove.emit(this.voyage);
  }
}
