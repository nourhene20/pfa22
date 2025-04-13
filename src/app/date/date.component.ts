import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date',
  imports: [FormsModule,CommonModule],
  templateUrl: './date.component.html',
  styleUrl: './date.component.scss'
})
export class DateComponent {
  startDate!: string;
  endDate!: string;
  constructor(private router :Router){}
  onNext() :void{
    this.router.navigate(['/candidats']);
  }
  
}
