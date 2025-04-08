import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Corrected HttpClient configuration with fetch
    provideHttpClient(withFetch()),
    // Zone.js change detection config
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router configuration
    provideRouter(routes),
    // Client hydration with event replay
    provideClientHydration(withEventReplay())
  ]
};