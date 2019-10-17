import { Directive, ViewContainerRef, TemplateRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformServer } from '@angular/common';


// This is a structural directive, so it will be able to show or hide DOM elements similar to *ngIf
@Directive({
  selector: '[appShellRender]'
})

export class AppShellRenderDirective implements OnInit {

  constructor(
    private viewContainer: ViewContainerRef, // Allows us to instantiate a template where the directive is applied
    private templateRef: TemplateRef<any>, // The template to be applied at the selector
    @Inject(PLATFORM_ID) private platformId // Allows us to determine whether this is being rendered on server or client
  ) {

  }

  ngOnInit() {
    const isRenderedOnServer = isPlatformServer(this.platformId); // Checks if rendered on server or client
    if (isRenderedOnServer) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
