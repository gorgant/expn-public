import { Directive, ViewContainerRef, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, UiStoreSelectors } from 'src/app/root-store';
import { Subscription } from 'rxjs';


// This is a structural directive, so it will be able to show or hide DOM elements similar to *ngIf
@Directive({
  selector: '[appShellNoRender]'
})

export class AppShellNoRenderDirective implements OnInit, OnDestroy {

  private isAngularUniversalSubscription: Subscription;

  constructor(
    private viewContainer: ViewContainerRef, // Allows us to instantiate a template where the directive is applied
    private templateRef: TemplateRef<any>, // The template to be applied at the selector
    private store$: Store<RootStoreState.State>,
  ) {

  }

  ngOnInit() {
    this.isAngularUniversalSubscription = this.store$.select(UiStoreSelectors.selectAngularUniversalDetected)
      .subscribe(isAngularUniversal => {
        if (isAngularUniversal) {
          console.log('Server rendering detected, clear view');
          this.viewContainer.clear();
        } else {
          console.log('Client rendering detected, deploying template');
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      })
  }

  ngOnDestroy() {
    if (this.isAngularUniversalSubscription) {
      this.isAngularUniversalSubscription.unsubscribe();
    }
    
  }

}
