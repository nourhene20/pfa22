import { ReactiveFormsModule } from '@angular/forms';



import { Component } from '@angular/core';


import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ReactiveFormsModule,
  HttpClientModule,
  
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pfa';
}
