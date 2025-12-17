import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaLocal',
  standalone: true
})
export class FechaLocalPipe implements PipeTransform {
  /**
   * Convierte un timestamp UTC del backend a hora local del navegador
   * @param value - Formato: "2025-12-16 15:30:00" (UTC+0)
   * @returns Fecha formateada en hora local:  "16/12/2025, 16:30:00"
   */
  transform(value: string | null | undefined): string {
    if (! value || value === 'N/A' || value === '-') {
      return value || 'N/A';
    }

    try {
      // El backend envía:  "2025-12-16 15:30:00" (UTC+0 sin indicador)
      // Convertir a formato ISO 8601: "2025-12-16T15:30:00Z"
      const isoString = value.replace(' ', 'T') + 'Z';
      const fecha = new Date(isoString);

      // Verificar si es válida
      if (isNaN(fecha.getTime())) {
        console.warn('Fecha inválida recibida:', value);
        return value;
      }

      // Convertir a hora local del navegador
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return value;
    }
  }
}
