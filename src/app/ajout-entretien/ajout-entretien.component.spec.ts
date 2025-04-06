import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutEntretienComponent } from './ajout-entretien.component';

describe('AjoutEntretienComponent', () => {
  let component: AjoutEntretienComponent;
  let fixture: ComponentFixture<AjoutEntretienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutEntretienComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutEntretienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
