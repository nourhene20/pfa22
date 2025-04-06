import { ReactiveFormsModule } from '@angular/forms';



import { Component } from '@angular/core';


import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pfa';
}
