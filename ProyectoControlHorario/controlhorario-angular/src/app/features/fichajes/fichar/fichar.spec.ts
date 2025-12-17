import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fichar } from './fichar';

describe('Fichar', () => {
  let component: Fichar;
  let fixture: ComponentFixture<Fichar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fichar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fichar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
