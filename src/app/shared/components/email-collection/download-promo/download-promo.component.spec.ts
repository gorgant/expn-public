import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DownloadPromoComponent } from './download-promo.component';

describe('DownloadPromoComponent', () => {
  let component: DownloadPromoComponent;
  let fixture: ComponentFixture<DownloadPromoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadPromoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
