import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarSolicitudes } from './aprobar-solicitudes';

describe('AprobarSolicitudes', () => {
  let component: AprobarSolicitudes;
  let fixture: ComponentFixture<AprobarSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprobarSolicitudes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobarSolicitudes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
