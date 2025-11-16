import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personnalisée pour formater les dates
 * Usage: {{ date | dateFormat:'short' }}
 * Formats disponibles: 'short' (01/01/2024), 'long' (1 janvier 2024), 'full' (lundi 1 janvier 2024)
 */
@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date | null | undefined, format: 'short' | 'long' | 'full' = 'short'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';

    const jour = date.getDate();
    const mois = date.getMonth();
    const annee = date.getFullYear();

    const moisNoms = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    const joursNoms = [
      'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'
    ];

    switch (format) {
      case 'short':
        return `${jour.toString().padStart(2, '0')}/${(mois + 1).toString().padStart(2, '0')}/${annee}`;
      case 'long':
        return `${jour} ${moisNoms[mois]} ${annee}`;
      case 'full':
        return `${joursNoms[date.getDay()]} ${jour} ${moisNoms[mois]} ${annee}`;
      default:
        return `${jour.toString().padStart(2, '0')}/${(mois + 1).toString().padStart(2, '0')}/${annee}`;
    }
  }

}
