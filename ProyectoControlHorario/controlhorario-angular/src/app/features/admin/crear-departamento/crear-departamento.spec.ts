import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDepartamento } from './crear-departamento';

describe('CrearDepartamento', () => {
  let component: CrearDepartamento;
  let fixture: ComponentFixture<CrearDepartamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDepartamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDepartamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
