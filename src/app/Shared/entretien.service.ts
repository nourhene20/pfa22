import { Injectable } from '@angular/core';
import { Entretien } from './entretien.entree';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntretienService {
 entretienSubject=new Subject<Entretien[]>();
  entretiens :Entretien[]=
  [new Entretien("Java","Wowwwww"),
    new Entretien("Marketing"	,"ewwwwwwww"),
    new Entretien("dffdfdf"	,"dffdfdf")
  ]

onDelete(index:number){
  this.entretiens.splice(index,1);
  this.entretienSubject.next(this.entretiens);
}
onAddEntretien(entretien:Entretien){
  this.entretiens.push(entretien);
  this.entretienSubject.next(this.entretiens);
}
getEntretien(index:number){
  return {...this.entretiens[index]};
}
getEntretiens(){
  return this.entretiens;
}


  constructor() { }
}
