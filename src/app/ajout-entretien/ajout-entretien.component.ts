import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntretienService } from '../Shared/entretien.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Entretien } from '../Shared/entretien.entree';

@Component({
  selector: 'app-ajout-entretien',
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-entretien.component.html',
  styleUrl: './ajout-entretien.component.scss'
})
export class AjoutEntretienComponent implements OnInit{
  entretienForm!: FormGroup;
  editMode=false;
  entretien!: Entretien;
  paramId!: number;
constructor(private entretienService :EntretienService,private router:Router,private activatedRoutes:ActivatedRoute)   {





}
ngOnInit(): void{
  this.activatedRoutes.paramMap.subscribe(paramMap=>{
    if(paramMap.has('id')){
      this.editMode=true;
      this.paramId=+paramMap.get('id')!;
      this.entretien=this.entretienService.getEntretien(this.paramId);
    }
    else{
      this.editMode=false;
    }
  })
this.entretienForm=new FormGroup({
  "domaine":new FormControl(this.editMode?this.entretien.domaine:null,[Validators.required]),
  "questions":new FormControl(this.editMode?this.entretien.questions:null,[Validators.required])
})
}
onSubmit(){
  const newEntretien=new Entretien(this.entretienForm.value.domaine,this.entretienForm.value.questions);
  this.entretienService.onAddEntretien(newEntretien);
  this.router.navigateByUrl("/gestion_entretien");
}
}
