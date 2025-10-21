import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Voyage } from '../../../models/voyage.model';

@Component({
  selector: 'app-voyage-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voyage-detail.component.html',
  styleUrl: './voyage-detail.component.scss'
})
export class VoyageDetailComponent {
  @Input() voyage: Voyage | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Voyage>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.voyage) {
      this.edit.emit(this.voyage);
    }
  }

  get coverImage(): string | undefined {
    if (!this.voyage) {
      return undefined;
    }
    return this.voyage.imageData || this.voyage.galleries?.[0] || this.voyage.imageUrl;
  }
}
