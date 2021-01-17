import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubConfirmationComponent } from './sub-confirmation.component';

describe('ConfirmationComponent', () => {
  let component: SubConfirmationComponent;
  let fixture: ComponentFixture<SubConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
