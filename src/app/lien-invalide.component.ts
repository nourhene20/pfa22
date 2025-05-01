import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lien-invalide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="text-align:center; margin-top:100px;">
      <h2>❌ Ce lien n’est plus valide.</h2>
      <p>La période autorisée est expirée ou non encore atteinte.</p>
    </div>
  `
})
export class LienInvalideComponent {}
