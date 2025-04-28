import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglageValiditeComponent } from './reglage-validite.component';

describe('ReglageValiditeComponent', () => {
  let component: ReglageValiditeComponent;
  let fixture: ComponentFixture<ReglageValiditeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglageValiditeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglageValiditeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
