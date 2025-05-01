import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LienInvalideComponent } from './lien-invalide.component';

describe('LienInvalideComponent', () => {
  let component: LienInvalideComponent;
  let fixture: ComponentFixture<LienInvalideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LienInvalideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LienInvalideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
