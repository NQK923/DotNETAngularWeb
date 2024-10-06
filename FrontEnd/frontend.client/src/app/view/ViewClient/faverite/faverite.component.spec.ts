import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaveriteComponent } from './faverite.component';

describe('FaveriteComponent', () => {
  let component: FaveriteComponent;
  let fixture: ComponentFixture<FaveriteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaveriteComponent]
    });
    fixture = TestBed.createComponent(FaveriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
