import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Voyage } from '../../../models/voyage.model';
import { CardHoverDirective } from '../../../directives/card-hover.directive';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

@Component({
  selector: 'app-voyage-card',
  standalone: true,
  imports: [CommonModule, CardHoverDirective, DateFormatPipe],
  templateUrl: './voyage-card.component.html',
  styleUrl: './voyage-card.component.scss'
})
export class VoyageCardComponent {
  @Input() voyage!: Voyage;
  @Input() showActions: boolean = false;
  @Output() voyageClick = new EventEmitter<Voyage>();
  @Output() deleteVoyage = new EventEmitter<number>();
  @Output() editVoyage = new EventEmitter<number>();

  onCardClick(): void {
    this.voyageClick.emit(this.voyage);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer le voyage "${this.voyage.titre}" ?`)) {
      this.deleteVoyage.emit(this.voyage.id);
    }
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editVoyage.emit(this.voyage.id);
  }

  getDefaultImage(): string {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop';
  }
}
