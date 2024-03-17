import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastCollectionComponent } from './podcast-collection.component';

describe('PodcastCollectionComponent', () => {
  let component: PodcastCollectionComponent;
  let fixture: ComponentFixture<PodcastCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastCollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PodcastCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
