import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificarFichajes } from './verificar-fichajes';

describe('VerificarFichajes', () => {
  let component: VerificarFichajes;
  let fixture: ComponentFixture<VerificarFichajes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificarFichajes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificarFichajes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
