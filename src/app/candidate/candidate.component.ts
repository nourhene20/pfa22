import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Candidate } from '../Shared/candidate.model';
import { CandidateService } from '../Shared/candidate.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';


@Component({
  selector: 'app-candidate',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule,NavBarComponent],
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.scss']
})
export class CandidateComponent implements OnInit {
  candidateForm: FormGroup;
  candidates: Candidate[] = [];
  isEditMode = false;

  constructor(private fb: FormBuilder, private candidateService: CandidateService) {
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
      },
      error: (err) => alert('Erreur : ' + err)
    });
  }

  editCandidate(candidate: Candidate): void {
    this.candidateForm.setValue({
      cin: candidate.cin,
      nom: candidate.nom,
      prenom: candidate.prenom,
      email: candidate.email,
      domaine: candidate.domaine,
      telephone: candidate.telephone,
      diplome: candidate.diplome
    });
    this.isEditMode = true;
  }

  deleteCandidate(cin: string): void {
    if (confirm("Voulez-vous vraiment supprimer ce candidat ?")) {
      this.candidateService.deleteCandidate(cin).subscribe(() => {
        this.loadCandidates();
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.candidateForm.reset();
  }
}