import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Voyage } from '../../../models/voyage.model';
import { AuthService } from '../../../services/auth.service';

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
  @Output() remove = new EventEmitter<Voyage>();

  private authService = inject(AuthService);

  get canEdit(): boolean {
    if (!this.voyage || !this.authService.user) return false;
    return this.voyage.userId === this.authService.user.id;
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.voyage) {
      this.edit.emit(this.voyage);
    }
  }

  onRemove(): void {
    if (this.voyage) {
      this.remove.emit(this.voyage);
    }
  }

  get coverImage(): string | undefined {
    if (!this.voyage) {
      return undefined;
    }
    return this.voyage.imageData || this.voyage.galleries?.[0] || this.voyage.imageUrl;
  }
}
