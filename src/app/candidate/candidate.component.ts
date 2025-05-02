import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Candidate } from '../Shared/candidate.model';
import { CandidateService } from '../Shared/candidate.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Router, RouterModule } from '@angular/router'; // 🔥 Import RouterModule

@Component({
  selector: 'app-candidate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.scss']
})
export class CandidateComponent implements OnInit {
  candidateForm: FormGroup;
  candidates: Candidate[] = [];
  isEditMode = false;
  successMessage: string = '';
  showCandidates: boolean = false;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private router: Router // ✅ Inject Router
  ) {
    this.candidateForm = this.fb.group({
      cin: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      domaine: ['', Validators.required],
      telephone: ['', Validators.required],
      diplome: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.candidateService.getCandidates().subscribe(data => {
      this.candidates = data;
    });
  }

  onSubmit(): void {
    if (this.candidateForm.invalid) return;

    const candidate: Candidate = this.candidateForm.value;

    const operation = this.isEditMode
      ? this.candidateService.updateCandidate(candidate)
      : this.candidateService.addCandidate(candidate);

    operation.subscribe({
      next: () => {
        this.loadCandidates();
        this.candidateForm.reset();
        this.isEditMode = false;
        this.showMessage(this.isEditMode ? 'Candidat modifié avec succès.' : 'Candidat ajouté avec succès.');
      },
      error: (err) => alert('Erreur : ' + err)
    });
  }

  editCandidate(candidate: Candidate): void {
    this.candidateForm.setValue(candidate);
    this.isEditMode = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCandidate(cin: string): void {
    if (confirm("Voulez-vous vraiment supprimer ce candidat ?")) {
      this.candidateService.deleteCandidate(cin).subscribe(() => {
        this.loadCandidates();
        this.showMessage('Candidat supprimé avec succès.');
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.candidateForm.reset();
  }

  resetForm(): void {
    this.candidateForm.reset();
    this.isEditMode = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }

  toggleCandidateList(): void {
    this.showCandidates = !this.showCandidates;
  }

  showMessage(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
