import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedDataService } from '../shared-data.service';
import { Router } from '@angular/router'; // ➡️ Ajoute Router !
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-reglage-validite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reglage-validite.component.html',
  styleUrls: ['./reglage-validite.component.scss']
})
export class ReglageValiditeComponent implements OnInit {
  today: string = '';
  startDate!: string;
  endDate!: string;
  minEndDate: string = '';
  errorMessage: string = '';

  selectedEmails: string[] = [];
  generatedLinks: string[] = [];
  selectedDomaine: string = '';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService,
    private router: Router // ➡️ Injecte Router ici
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.minEndDate = this.today;

    this.selectedEmails = this.sharedDataService.selectedEmails;
    this.generatedLinks = this.sharedDataService.generatedLinks;
    this.selectedDomaine = this.sharedDataService.selectedDomaine;

    if (typeof window !== 'undefined') {
      if (!this.selectedEmails.length) {
        const storedEmails = localStorage.getItem('selectedEmails');
        if (storedEmails) {
          this.selectedEmails = JSON.parse(storedEmails);
        }
      }

      if (!this.generatedLinks.length) {
        const storedLinks = localStorage.getItem('generatedLinks');
        if (storedLinks) {
          this.generatedLinks = JSON.parse(storedLinks);
        }
      }

      if (!this.selectedDomaine) {
        const storedDomaine = localStorage.getItem('selectedDomaine');
        if (storedDomaine) {
          this.selectedDomaine = storedDomaine;
        }
      }
    }

    console.log('✅ Emails récupérés :', this.selectedEmails);
    console.log('✅ Liens récupérés :', this.generatedLinks);
    console.log('✅ Domaine récupéré :', this.selectedDomaine);
  }

  updateEndDateMin(): void {
    if (this.startDate) {
      this.minEndDate = this.startDate;
    } else {
      this.minEndDate = this.today;
    }
  }

  onSaveValidity(): void {
    this.errorMessage = '';
  
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Veuillez sélectionner une date de début et une date de fin.';
      return;
    }
  
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.errorMessage = 'Dates invalides sélectionnées.';
      return;
    }
  
    if (end <= start) {
      this.errorMessage = 'La date de fin doit être après la date de début.';
      return;
    }
  
    console.log('✅ Période de validité validée :', this.startDate, this.endDate);
  
    this.saveLinks();
  }
  
  saveLinks(): void {
    if (!this.selectedEmails.length || !this.generatedLinks.length || !this.selectedDomaine) {
      console.error('Pas assez de données pour enregistrer.');
      return;
    }

    let completedRequests = 0;
    const totalRequests = this.selectedEmails.length;

    this.selectedEmails.forEach((email, index) => {
      const lienGenere = this.generatedLinks[index];

      this.http.post('http://localhost:3000/api/links/add', {
        email: email,
        domaine: this.selectedDomaine,
        dateDebut: this.startDate,
        dateFin: this.endDate,
        lienGeneré: lienGenere
      }).subscribe({
        next: (response) => {
          console.log('✅ Réponse du serveur :', response);
          completedRequests++;
          if (completedRequests === totalRequests) {
            // ➡️ Quand tous les envois sont terminés :
            console.log('✅ Tous les liens enregistrés, redirection...');
            this.afterSave();
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'envoi :', error);
          completedRequests++;
          if (completedRequests === totalRequests) {
            this.afterSave();
          }
        }
      });
    });
  }

  afterSave(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedEmails');
      localStorage.removeItem('generatedLinks');
      localStorage.removeItem('selectedDomaine');
    }

    this.router.navigate(['/resume']); // 🔥 Redirige vers /resume
  }
}
