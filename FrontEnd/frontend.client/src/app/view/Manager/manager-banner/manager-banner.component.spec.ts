import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerBannerComponent } from './manager-banner.component';

describe('ManagerBannerComponent', () => {
  let component: ManagerBannerComponent;
  let fixture: ComponentFixture<ManagerBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerBannerComponent]
    });
    fixture = TestBed.createComponent(ManagerBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
