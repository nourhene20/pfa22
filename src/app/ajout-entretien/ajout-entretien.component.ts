import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { EntretienService } from '../Shared/entretien.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Entretien } from '../Shared/entretien.entree';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ajout-entretien',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ajout-entretien.component.html',
  styleUrls: ['./ajout-entretien.component.scss']
})
export class AjoutEntretienComponent implements OnInit, OnDestroy {
  entretienForm!: FormGroup;
  editMode = false;
  loading = false;
  paramId!: string;
  fileError: string = ''; // To display file-related errors
  existingDomaines: string[] = []; // Store existing domaine names

  private destroy$ = new Subject<void>();
  private subscription!: Subscription;

  constructor(
    private entretienService: EntretienService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadExistingDomaines(); // Fetch existing domaines
    this.initializeForm();
    this.checkEditMode();
  }

  private loadExistingDomaines(): void {
    this.entretienService.entretiens$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entretiens) => {
          this.existingDomaines = entretiens.map(e => e.domaine.toLowerCase());
        },
        error: () => {
          this.fileError = 'Erreur lors du chargement des domaines existants.';
        }
      });
    // Trigger initial load if entretiens$ is empty
    this.entretienService.loadEntretiens();
  }

  private initializeForm(): void {
    this.entretienForm = new FormGroup({
      domaine: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
        this.uniqueDomaineValidator()
      ]),
      questions: new FormControl('', [Validators.required, Validators.maxLength(500)])
    });
  }

  // Custom validator for unique domaine
  private uniqueDomaineValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const domaine = control.value?.trim().toLowerCase();
      if (domaine && this.existingDomaines.includes(domaine) && (!this.editMode || domaine !== this.entretienForm.get('domaine')?.value?.toLowerCase())) {
        return { duplicateDomaine: true };
      }
      return null;
    };
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
        error: () => this.router.navigate(['/gestion-entretien'])
      });
  }

  // Handle drag-over event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Handle drag-enter event
  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Handle file drop event
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.fileError = '';

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/plain') {
        this.readFile(file);
      } else {
        this.fileError = 'Seuls les fichiers texte (.txt) sont acceptés.';
      }
    }
  }

  // Handle file input change
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'text/plain') {
        this.readFile(file);
      } else {
        this.fileError = 'Seuls les fichiers texte (.txt) sont acceptés.';
      }
    }
  }

  // Read file contents
  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const truncatedContent = content.substring(0, 500);
      this.entretienForm.get('questions')?.setValue(truncatedContent);
      this.entretienForm.get('questions')?.markAsTouched();
    };
    reader.onerror = () => {
      this.fileError = 'Erreur lors de la lecture du fichier.';
    };
    reader.readAsText(file);
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
        next: () => {
          if (!this.editMode) {
            this.entretienForm.reset(); // Clear form fields
            this.entretienForm.markAsPristine(); // Reset form state
            this.entretienService.loadEntretiens(); // Refresh entretiens list
            // Navigate to refresh component state
            this.router.navigate(['/gestion-entretien']);
          }
        },
        error: () => {
          this.fileError = 'Erreur lors de l\'enregistrement de l\'entretien.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/gestion-entretien']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
  }
}