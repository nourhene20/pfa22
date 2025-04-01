import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminComponent } from './admin/admin.component';

@Component({
  selector: 'app-root',
  imports: [
/*AdminComponent,*/

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pfa';
}
