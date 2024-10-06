import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitlesComponent } from './titles.component';

describe('TitlesComponent', () => {
  let component: TitlesComponent;
  let fixture: ComponentFixture<TitlesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitlesComponent]
    });
    fixture = TestBed.createComponent(TitlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
