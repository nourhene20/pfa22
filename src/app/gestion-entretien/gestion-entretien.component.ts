import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntretienService } from '../Shared/entretien.service';
import { Entretien } from '../Shared/entretien.entree';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-entretien',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-entretien.component.html',
  styleUrls: ['./gestion-entretien.component.scss']
})
export class GestionEntretienComponent implements OnInit, OnDestroy {
  entretiens: Entretien[] = [];
  private destroy$ = new Subject<void>();
  private subscription!: Subscription;

  constructor(private entretienService: EntretienService) {}

  ngOnInit(): void {
    this.loadData();
    this.subscription = this.entretienService.entretiens$
      .pipe(takeUntil(this.destroy$))
      .subscribe(entretiens => this.entretiens = entretiens);
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