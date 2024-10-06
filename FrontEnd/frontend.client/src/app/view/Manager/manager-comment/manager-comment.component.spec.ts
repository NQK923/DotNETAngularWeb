import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerCommentComponent } from './manager-comment.component';

describe('ManagerCommentComponent', () => {
  let component: ManagerCommentComponent;
  let fixture: ComponentFixture<ManagerCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerCommentComponent]
    });
    fixture = TestBed.createComponent(ManagerCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
