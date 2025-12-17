import { TestBed } from '@angular/core/testing';

import { Fichaje } from './fichaje';

describe('Fichaje', () => {
  let service: Fichaje;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fichaje);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
