import { Injectable } from '@angular/core';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  /**
   * Renderizar el reCAPTCHA en un contenedor específico
   */
  render(containerId: string, siteKey: string, callback: (token: string) => void): number | null {
    if (typeof grecaptcha === 'undefined') {
      console.error('grecaptcha no está definido.  Asegúrate de cargar el script de Google reCAPTCHA.');
      return null;
    }

    try {
      const widgetId = grecaptcha.render(containerId, {
        sitekey:  siteKey,
        callback:  callback
      });
      return widgetId;
    } catch (error) {
      console.error('Error al renderizar reCAPTCHA:', error);
      return null;
    }
  }

  /**
   * Obtener el token del reCAPTCHA
   */
  getResponse(widgetId?:  number): string {
    if (typeof grecaptcha === 'undefined') {
      return '';
    }
    return grecaptcha.getResponse(widgetId);
  }

  /**
   * Resetear el reCAPTCHA
   */
  reset(widgetId?: number): void {
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.reset(widgetId);
    }
  }

  /**
   * Verificar si grecaptcha está listo
   */
  isReady(): boolean {
    return typeof grecaptcha !== 'undefined' && grecaptcha.ready !== undefined;
  }
}