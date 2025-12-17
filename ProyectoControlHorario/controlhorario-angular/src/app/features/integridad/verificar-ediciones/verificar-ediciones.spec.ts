import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificarEdiciones } from './verificar-ediciones';

describe('VerificarEdiciones', () => {
  let component: VerificarEdiciones;
  let fixture: ComponentFixture<VerificarEdiciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificarEdiciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificarEdiciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
