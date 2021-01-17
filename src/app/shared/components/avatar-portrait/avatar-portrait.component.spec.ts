import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AvatarPortraitComponent } from './avatar-portrait.component';

describe('AvatarPortraitComponent', () => {
  let component: AvatarPortraitComponent;
  let fixture: ComponentFixture<AvatarPortraitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AvatarPortraitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarPortraitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
