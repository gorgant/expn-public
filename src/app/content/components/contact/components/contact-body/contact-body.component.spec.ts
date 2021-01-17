import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContactBodyComponent } from './contact-body.component';

describe('ContactBodyComponent', () => {
  let component: ContactBodyComponent;
  let fixture: ComponentFixture<ContactBodyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
