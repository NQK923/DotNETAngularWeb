import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ManagerStatiscalComponent} from './manager-statiscal.component';

describe('ManagerStatiscalComponent', () => {
  let component: ManagerStatiscalComponent;
  let fixture: ComponentFixture<ManagerStatiscalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerStatiscalComponent]
    });
    fixture = TestBed.createComponent(ManagerStatiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
