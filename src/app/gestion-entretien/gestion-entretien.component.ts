import { Component, OnDestroy, OnInit } from '@angular/core';
import { Entretien } from '../Shared/entretien.entree';
import { EntretienService } from '../Shared/entretien.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-gestion-entretien',
  standalone: true,
  imports: [CommonModule ], 
  templateUrl: './gestion-entretien.component.html',
  styleUrls: ['./gestion-entretien.component.scss']
})
export class GestionEntretienComponent  implements OnInit,OnDestroy{
 entretiens: Entretien[] = [];
 entretienSubscription=new Subscription();
 constructor(private entretienService:EntretienService,private router:Router){}
  ngOnDestroy(): void {
    this.entretienSubscription.unsubscribe();
  }
  ngOnInit(): void {
    this.entretienSubscription=this.entretienService.entretienSubject.subscribe(entretiens=>{
      this.entretiens=entretiens;
    });
    this.entretiens=this.entretienService.entretiens;
  }
  onDelete(index:number){
    this.entretienService.onDelete(index);
  }
  onEdit(index:number){
    this.router.navigate(["edit", index]);
  }
  
  }
