import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFichaje } from './editar-fichaje';

describe('EditarFichaje', () => {
  let component: EditarFichaje;
  let fixture: ComponentFixture<EditarFichaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarFichaje]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarFichaje);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
