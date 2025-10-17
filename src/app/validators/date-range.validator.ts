import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator personnalisé afin de verif que la date de fin est après la date de début
 */
export function dateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dateDebut = control.get('dateDebut');
    const dateFin = control.get('dateFin');

    if (!dateDebut || !dateFin) {
      return null;
    }

    const debut = new Date(dateDebut.value);
    const fin = new Date(dateFin.value);

    if (debut && fin && fin <= debut) {
      return { dateRange: { message: 'La date de fin doit être après la date de début' } };
    }

    return null;
  };
}
