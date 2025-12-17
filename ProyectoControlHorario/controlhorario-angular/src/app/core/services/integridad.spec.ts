import { TestBed } from '@angular/core/testing';

import { Integridad } from './integridad';

describe('Integridad', () => {
  let service: Integridad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Integridad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
