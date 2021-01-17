import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostCollectionComponent } from './post-collection.component';

describe('EInActionComponent', () => {
  let component: PostCollectionComponent;
  let fixture: ComponentFixture<PostCollectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
