import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

/**
 * Directive personnalisée pour ajouter un effet hover sur les cartes
 * Ajoute une ombre et une légère translation au survol
 */
@Directive({
  selector: '[appCardHover]',
  standalone: true
})
export class CardHoverDirective {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Style initial
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-5px)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 8px 16px rgba(53, 167, 255, 0.3)');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)');
  }

}
