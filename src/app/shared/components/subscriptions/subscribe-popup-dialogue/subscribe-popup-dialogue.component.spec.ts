import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribePopupDialogueComponent } from './subscribe-popup-dialogue.component';

describe('SubscribePopupDialogueComponent', () => {
  let component: SubscribePopupDialogueComponent;
  let fixture: ComponentFixture<SubscribePopupDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribePopupDialogueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscribePopupDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
