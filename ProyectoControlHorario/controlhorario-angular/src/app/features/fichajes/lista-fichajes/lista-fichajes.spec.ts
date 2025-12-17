import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaFichajes } from './lista-fichajes';

describe('ListaFichajes', () => {
  let component: ListaFichajes;
  let fixture: ComponentFixture<ListaFichajes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaFichajes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaFichajes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
