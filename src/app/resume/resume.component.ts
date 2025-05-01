import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
  domaine: string = '';
  selectedEmails: string[] = [];
  generatedLinks: string[] = [];
  isLoading: boolean = false;

  constructor(
    private sharedDataService: SharedDataService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const emailsFromService = this.sharedDataService.selectedEmails;
    const linksFromService = this.sharedDataService.generatedLinks;
    const domaineFromService = this.sharedDataService.selectedDomaine;

    if (typeof window !== 'undefined') {
      this.selectedEmails = emailsFromService.length
        ? emailsFromService
        : JSON.parse(localStorage.getItem('selectedEmails') || '[]');

      this.generatedLinks = linksFromService.length
        ? linksFromService
        : JSON.parse(localStorage.getItem('generatedLinks') || '[]');

      this.domaine = domaineFromService || localStorage.getItem('selectedDomaine') || '';
    } else {
      this.selectedEmails = emailsFromService;
      this.generatedLinks = linksFromService;
      this.domaine = domaineFromService;
    }

    if (!this.domaine || !this.selectedEmails.length || !this.generatedLinks.length) {
      console.warn('⚠️ Certaines données sont manquantes après récupération.');
    }
  }

  envoyerLiens(): void {
    if (!this.selectedEmails.length || !this.generatedLinks.length) {
      alert('❗ Aucune donnée à envoyer.');
      return;
    }

    this.isLoading = true;

    const payload = this.selectedEmails.map((email, index) => ({
      email: email,
      lien: this.generatedLinks[index]
    }));

    this.http.post('http://localhost:3000/api/send-links', payload).subscribe({
      next: () => {
        localStorage.removeItem('selectedEmails');
        localStorage.removeItem('generatedLinks');
        localStorage.removeItem('selectedDomaine');
    
        this.isLoading = false;
        alert('✅ Liens envoyés avec succès aux candidats !');
        this.router.navigate(['/']);
      },
      error: (err) => {    
        alert('✅ Liens envoyés avec succès aux candidats !');
        this.isLoading = false;
        
        this.router.navigate(['/admin']);
      }
    });
    
  }
}
