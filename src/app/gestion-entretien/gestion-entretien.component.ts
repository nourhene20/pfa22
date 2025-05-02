import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntretienService } from '../Shared/entretien.service';
import { Entretien } from '../Shared/entretien.entree';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AjoutEntretienComponent } from '../ajout-entretien/ajout-entretien.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-gestion-entretien',
  standalone: true,
  imports: [CommonModule, FormsModule,NavbarComponent,AjoutEntretienComponent,FooterComponent], 
  templateUrl: './gestion-entretien.component.html',
  styleUrls: ['./gestion-entretien.component.scss']
})
export class GestionEntretienComponent implements OnInit, OnDestroy {
  entretiens: Entretien[] = [];
  editingId: string | null = null;
  editedEntretien!: Entretien;
  originalEntretien!: Entretien;
  
  private destroy$ = new Subject<void>();
  private subscription!: Subscription;

  constructor(private entretienService: EntretienService) {}

  ngOnInit(): void {
    this.loadData();
    this.subscription = this.entretienService.entretiens$
      .pipe(takeUntil(this.destroy$))
      .subscribe(entretiens => this.entretiens = entretiens);
  }

  onEdit(entretien: Entretien): void {
    this.editingId = entretien.id;
    this.editedEntretien = { ...entretien };
    this.originalEntretien = { ...entretien };
  }

  onSave(): void {
    if (this.editingId && this.editedEntretien) {
      this.entretienService.updateEntretien(this.editingId, this.editedEntretien)
        .subscribe({
          next: () => {
            this.editingId = null;
            this.loadData();
          },
          error: (err) => console.error('Erreur de mise à jour:', err)
        });
    }
  }

  onCancel(): void {
    if (this.editingId) {
      const index = this.entretiens.findIndex(e => e.id === this.editingId);
      if (index > -1) {
        this.entretiens[index] = { ...this.originalEntretien };
      }
      this.editingId = null;
    }
  }



  loadData(): void {
    this.entretienService.loadEntretiens();
  }

  onDelete(id: string): void {
    this.entretienService.deleteEntretien(id).subscribe();
  }

  trackById(index: number, entretien: Entretien): string {
    return entretien.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
  }
  
}