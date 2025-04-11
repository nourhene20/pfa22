import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntretienService } from '../Shared/entretien.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Entretien } from '../Shared/entretien.entree';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ajout-entretien',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './ajout-entretien.component.html',
  styleUrls: ['./ajout-entretien.component.scss']
})
export class AjoutEntretienComponent implements OnInit, OnDestroy {
  entretienForm!: FormGroup;
  editMode = false;
  loading = false;
  paramId!: string;
  
  private destroy$ = new Subject<void>();
  private subscription!: Subscription;

  constructor(
    private entretienService: EntretienService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.entretienForm = new FormGroup({
      domaine: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      questions: new FormControl('', [Validators.required, Validators.maxLength(500)])
    });
  }

  private checkEditMode(): void {
    this.subscription = this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(paramMap => {
        if (paramMap.has('id')) {
          this.editMode = true;
          this.paramId = paramMap.get('id')!;
          this.loadEntretienForEdit();
        }
      });
  }

  private loadEntretienForEdit(): void {
    this.loading = true;
    this.entretienService.getEntretien(this.paramId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entretien) => {
          this.entretienForm.patchValue(entretien);
          this.loading = false;
        },
        error: () => this.router.navigate(['/'])
      });
  }

  onSubmit(): void {
    if (this.entretienForm.invalid || this.loading) return;

    this.loading = true;
    const entretien: Entretien = {
      id: this.editMode ? this.paramId : '',
      ...this.entretienForm.value
    };

    const operation$ = this.editMode 
      ? this.entretienService.updateEntretien(this.paramId, entretien)
      : this.entretienService.createEntretien(entretien);

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.loading = false,
        complete: () => this.loading = false
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
  }
  onCancel(): void {
  this.router.navigate(['/']);
}

}