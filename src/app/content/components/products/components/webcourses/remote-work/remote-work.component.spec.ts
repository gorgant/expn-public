import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RemoteWorkComponent } from './remote-work.component';

describe('RemoteWorkComponent', () => {
  let component: RemoteWorkComponent;
  let fixture: ComponentFixture<RemoteWorkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
