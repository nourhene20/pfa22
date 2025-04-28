// shared-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  selectedEmails: string[] = [];
  selectedDomaine: string = '';
  generatedLinks: string[] = []; 
}
