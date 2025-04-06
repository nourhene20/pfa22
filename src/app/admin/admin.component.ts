import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements AfterViewInit {
  @ViewChild('questionFile') questionFileInput!: ElementRef;
  @ViewChild('goToClientPage') goToClientPageLink!: ElementRef;
  @ViewChild('responsesText') responsesText!: ElementRef;
  @ViewChild('downloadResponses') downloadResponsesButton!: ElementRef;
  @ViewChild('downloadVideo') downloadVideoButton!: ElementRef;

  constructor(private storageService: StorageService) {}

  // Utiliser AfterViewInit au lieu de OnInit pour accéder aux éléments du DOM
  ngAfterViewInit(): void {
    this.loadResponses();
  }

  // Charger les réponses depuis le localStorage
  loadResponses(): void {
    const storedResponses = this.storageService.getItem('responses');
    if (storedResponses) {
      this.responsesText.nativeElement.textContent = storedResponses;
      this.downloadResponsesButton.nativeElement.disabled = false;
    } else {
      this.responsesText.nativeElement.textContent = 'Aucune réponse trouvée.';
    }
  }

  /*onDownloadResponses(): void {
    const responses = this.storageService.getItem('responses');
    if (responses) {
      const blob = new Blob([responses], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reponses.txt';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Aucune réponse disponible à télécharger.');
    }
  }

  // Télécharger la vidéo
  onDownloadVideo(): void {
    const videoBlob = this.storageService.getItem('videoBlob');
    if (videoBlob) {
      const blob = new Blob([videoBlob], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interview.webm';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Aucune vidéo disponible à télécharger.');
    }
  }*/
}
